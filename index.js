const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // allow all origins
app.use(express.json({ limit: '10mb' }));

app.post('/generate', async (req, res) => {
  const { prompt, size = '1024x1024', apiKey } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  // Use key from request body OR from server env (more secure)
  const key = process.env.OPENAI_API_KEY || apiKey;
  if (!key) return res.status(400).json({ error: 'Missing OpenAI API key' });

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard',
        response_format: 'b64_json'
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json({ image: data.data[0].b64_json });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
