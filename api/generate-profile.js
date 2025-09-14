import OpenAI from 'openai';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing input content' });
        }

        const prompt = `
You are an AI assistant for Corporate AI Solutions, a company that connects seasoned executives with AI expertise. Based on the provided input, generate a professional bio tailored for our corporate AI consulting network. The input may include brief details about experience or expertise. Keep the bio concise, 50-100 words, and emphasize relevant AI consulting experience. Return the response in JSON format with the following fields: bio.

Input:
${content}

Output format:
{
  "bio": ""
}
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a professional bio generator.' },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
        });

        const generatedProfile = JSON.parse(completion.choices[0].message.content);
        if (!generatedProfile.bio) {
            return res.status(500).json({ error: 'Failed to generate valid bio' });
        }

        return res.status(200).json({
            success: true,
            profile: generatedProfile,
        });

    } catch (error) {
        console.error('Error in generate-profile:', error);
        return res.status(500).json({
            error: 'Function failed',
            message: error.message,
            stack: error.stack,
        });
    }
}