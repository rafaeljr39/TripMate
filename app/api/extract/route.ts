import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(request: Request) {
  try {
    const { base64, mediaType } = await request.json()

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
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
- title: short descriptive title (e.g. "Flight to Tokyo", "Airbnb Shibuya", "El Clasico Match")
- location: venue, address, airport, hotel address etc
- start_time: ISO 8601 format datetime if found (e.g. 2026-04-20T14:30:00)
- end_time: ISO 8601 format datetime if found
- confirmation_code: booking reference, confirmation number, ticket number
- price: numeric amount only (e.g. 299.99)
- currency: 3-letter currency code (e.g. USD, EUR, GBP)
- notes: any other useful info like seat numbers, special instructions, check-in info

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