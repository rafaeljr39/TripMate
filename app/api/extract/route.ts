import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic()

const rateLimitMap = new Map<string, { count: number, resetAt: number }>()
const MAX_REQUESTS = 20
const WINDOW_MS = 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const today = new Date().toISOString().slice(0, 10)

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
Today's date is ${today}. All extracted dates must be in the future relative to today.

Extract all available details and return ONLY a JSON object with these fields:

- type: one of "flight", "hotel", "tour", "restaurant", "transport", "activity", "other"
- title: short descriptive title (e.g. "Flight to Tokyo", "HI Brussels Hostel", "El Clasico Match")
- location: venue, address, airport, or hotel address
- start_time: for HOTELS use check-in date in format "YYYY-MM-DDT12:00:00". For FLIGHTS and EVENTS use full ISO 8601 datetime. If no date is visible, return null.
- end_time: for HOTELS use check-out date in format "YYYY-MM-DDT12:00:00". For FLIGHTS return null if not shown.
- confirmation_code: booking reference, confirmation number, or ticket number
- price: numeric amount only (e.g. 299.99)
- currency: 3-letter currency code (e.g. USD, EUR, GBP)
- notes: any other useful info like seat numbers, special instructions, or booking details

CRITICAL DATE RULES:
- Today is ${today}
- NEVER return a date in the past
- If you see a month and day but no year, use the next future occurrence of that date
- If no date is visible at all, return null for start_time and end_time — do NOT guess
- For hotels: start_time = check-in DATE, end_time = check-out DATE (ignore check-in/out times)
- Example: if today is 2026-03-28 and you see "July 17" with no year, use "2026-07-17"

Return ONLY the JSON object. No explanation, no markdown, no backticks.`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleaned)

    // Auto-correct any past dates to next year as a safety net
    const nowDate = new Date()
    function correctYear(dateStr: string | undefined): string | undefined {
      if (!dateStr) return dateStr
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      if (d < nowDate) {
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