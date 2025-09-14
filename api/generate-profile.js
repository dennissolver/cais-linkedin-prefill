import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { linkedinContent } = req.body;

        if (!linkedinContent) {
            return res.status(400).json({ error: 'LinkedIn content required' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at creating professional profiles. Return valid JSON only with fields: name, title, expertise (array), bio, linkedin, email, photo (empty string)."
                },
                {
                    role: "user",
                    content: `Extract and reformat this LinkedIn profile:\n\n${linkedinContent}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1000
        });

        const profileData = JSON.parse(completion.choices[0].message.content);

        // Ensure expertise is array
        if (typeof profileData.expertise === 'string') {
            profileData.expertise = profileData.expertise.split(',').map(s => s.trim());
        }

        // Set defaults
        profileData.linkedin = profileData.linkedin || '';
        profileData.email = profileData.email || '';
        profileData.photo = '';

        return res.json(profileData);

    } catch (error) {
        console.error('AI generation error:', error);
        return res.status(500).json({
            error: 'Failed to generate profile',
            details: error.message
        });
    }
}