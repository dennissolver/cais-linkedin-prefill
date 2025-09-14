export default async function handler(req, res) {
    try {
        // Test if basic function works
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Test if environment variable exists
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        // Test if OpenAI import works
        const { OpenAI } = await import('openai');

        return res.status(200).json({
            success: true,
            message: 'Function is working',
            hasApiKey: !!process.env.OPENAI_API_KEY
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Function failed',
            message: error.message,
            stack: error.stack
        });
    }
}