import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    console.log("API HIT 🚀")

    const { proof } = await req.json()

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Check if this proof shows actual work done or not: ${proof}. Reply only YES or NO.`
          }
        ]
      })
    })

    const text = await response.text()   // 👈 SAFE READ
    console.log("RAW AI RESPONSE:", text)

    const data = JSON.parse(text)        // 👈 parse manually

    const reply = data?.choices?.[0]?.message?.content || "NO"

    return NextResponse.json({ result: reply })

  } catch (error) {
    console.error("API ERROR:", error)
    return NextResponse.json({ result: "NO" })
  }
}