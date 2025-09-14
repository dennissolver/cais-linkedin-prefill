import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { linkedinContent } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert at creating professional profiles for Corporate AI Solutions' expert network. Return valid JSON only with fields: name, title, expertise (array), bio, linkedin, email, photo (empty string)."
                },
                {
                    role: "user",
                    content: `Extract and reformat this LinkedIn profile for Corporate AI Solutions expert network:\n\n${linkedinContent}`
                }
            ],
            response_format: { type: "jso