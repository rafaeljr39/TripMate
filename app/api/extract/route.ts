import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: Request) {
  try {
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

Return ONLY the JSON object. No explanation, no markdown, no backticks.`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleaned)
    return NextResponse.json(data)

  } catch (err: any) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to extract' }, { status: 500 })
  }
}