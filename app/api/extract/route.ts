import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

// Simple in-memory rate limiter — resets on server restart
const rateLimitMap = new Map<string, { count: number, resetAt: number }>()
const MAX_REQUESTS = 20 // per user per day
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const now = Date.now()
    const userLimit = rateLimitMap.get(user.id)

    if (userLimit) {
      if (now < userLimit.resetAt) {
        if (userLimit.count >= MAX_REQUESTS) {
          return NextResponse.json(
            { error: `Daily limit of ${MAX_REQUESTS} extractions reached. Try again tomorrow.` },
            { status: 429 }
          )
        }
        userLimit.count++
      } else {
        rateLimitMap.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
      }
    } else {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
    }

    const { base64, mediaType } = await request.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `You are extracting travel booking details from a confirmation screenshot.
Extract all available details and return ONLY a JSON object with these fields:

- type: one of "flight", "hotel", "tour", "restaurant", "transport", "activity", "other"
- title: short descriptive title (e.g. "Flight to Tokyo", "HI Brussels Hostel", "El Clasico Match")
- location: venue, address, airport, or hotel address
- start_time: for HOTELS and ACCOMMODATION use date only in format "YYYY-MM-DDT12:00:00" (check-in date, set time to 12:00). For FLIGHTS and EVENTS use full ISO 8601 datetime (e.g. "2026-04-20T14:30:00")
- end_time: for HOTELS and ACCOMMODATION use date only in format "YYYY-MM-DDT12:00:00" (check-out date, set time to 12:00). For FLIGHTS and EVENTS use full ISO 8601 datetime if available
- confirmation_code: booking reference, confirmation number, or ticket number
- price: numeric amount only (e.g. 299.99)
- currency: 3-letter currency code (e.g. USD, EUR, GBP)
- notes: any other useful info like seat numbers, special instructions, or booking details

IMPORTANT FOR HOTELS:
- start_time = check-in DATE (ignore the check-in time like 3:00 PM)
- end_time = check-out DATE (ignore the check-out time like 11:00 AM)
- Example: if check-in is July 22 and check-out is July 25, use "2026-07-22T12:00:00" and "2026-07-25T12:00:00"
- This ensures the hotel spans the correct days on the calendar

IMPORTANT FOR DATES: Always use future dates. If a year is ambiguous, use the next upcoming year from today. Never extract a date in the past unless explicitly stated.

Return ONLY the JSON object. No explanation, no markdown, no backticks.`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleaned)

    // Auto-correct past dates to next upcoming year
    const now = new Date()
    function correctYear(dateStr: string | undefined): string | undefined {
      if (!dateStr) return dateStr
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      if (d < now) {
        d.setFullYear(d.getFullYear() + 1)
        return d.toISOString().slice(0, 19)
      }
      return dateStr
    }

    if (data.start_time) data.start_time = correctYear(data.start_time)
    if (data.end_time) data.end_time = correctYear(data.end_time)

    return NextResponse.json(data)

  } catch (err: any) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to extract' }, { status: 500 })
  }
}