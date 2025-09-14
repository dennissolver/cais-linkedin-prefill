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
            return res.status(400).json({ error: 'Invalid or missing LinkedIn content' });
        }

        const prompt = `
You are an AI assistant for Corporate AI Solutions, a company that connects seasoned executives with AI expertise. Given a user's LinkedIn profile content, generate a professional profile tailored for our corporate AI consulting network. Extract and emphasize relevant experience and expertise. If the content includes a profile photo URL (e.g., an image link), include it; otherwise, set photoUrl to an empty string. Return the response in JSON format with the following fields: name, title, expertiseAreas (comma-separated string), bio, linkedinUrl (if found), email (if found), photoUrl.

LinkedIn content:
${content}

Output format:
{
  "name": "",
  "title": "",
  "expertiseAreas": "",
  "bio": "",
  "linkedinUrl": "",
  "email": "",
  "photoUrl": ""
}
`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a professional profile generator.' },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
        });

        const generatedProfile = JSON.parse(completion.choices[0].message.content);

        if (!generatedProfile.name || !generatedProfile.title) {
            return res.status(500).json({ error: 'Failed to generate valid profile' });
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