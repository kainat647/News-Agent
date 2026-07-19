import Groq from 'groq-sdk';

export async function POST(request: Request) {
  const { title } = await request.json();

  if (!title) {
    return Response.json({ error: 'No title provided' }, { status: 400 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const message = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Explain in 1–2 sentences why this news story matters: "${title}"`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const explanation = message.choices[0]?.message?.content || 'Could not generate explanation';

    return Response.json({ explanation });
  } catch (error) {
    console.error('Groq error:', error);
    return Response.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}