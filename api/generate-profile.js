// api/generate-profile.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    // Enable CORS
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

        if (!linkedinContent || linkedinContent.trim().length < 50) {
            return res.status(400).json({
                error: 'LinkedIn content is required and must be substantial'
            });
        }

        const systemPrompt = `You are an expert at creating professional profiles for Corporate AI Solutions' expert network.

Extract key information and reformat specifically for a corporate AI consulting network.

Focus on:
- AI, technology, digital transformation, and business strategy experience
- Corporate/enterprise experience
- Practical, results-driven expertise
- Professional, concise descriptions

Return valid JSON only with these exact fields:
- name: Full professional name
- title: Current role/title (corporate-focused)
- expertise: Array of 3-5 specific expertise areas
- bio: 2-3 sentence professional bio emphasizing corporate AI/tech experience
- linkedin: LinkedIn URL if found (or empty string)
- email: Email if found (or empty string)
- photo: Empty string

Be concise and professional.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Extract and reformat this LinkedIn profile for Corporate AI Solutions expert network:\n\n${linkedinContent}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1000
        });

        const generatedContent = completion.choices[0].message.content;
        const profileData = JSON.parse(generatedContent);

        // Validate required fields
        const requiredFields = ['name', 'title', 'expertise', 'bio'];
        const missingFields = requiredFields.filter(field => !profileData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Ensure expertise is an array
        if (typeof profileData.expertise === 'string') {
            profileData.expertise = profileData.expertise.split(',').map(s => s.trim());
        }

        // Set defaults