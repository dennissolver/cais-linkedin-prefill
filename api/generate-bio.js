export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003', // Or 'gpt-3.5-turbo'
        prompt: `Generate a professional bio for a grey-hair expert based on this input: ${input}. Keep it concise, 50-100 words, tailored for AI consulting.`,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ bio: data.choices[0].text.trim() });
    } else {
      res.status(500).json({ error: 'No bio generated' });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate bio' });
  }
}