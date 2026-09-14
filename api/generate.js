// api/generate.js — прокси к Google Gemini (CommonJS)
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_KEY не настроен на сервере' });
    return;
  }

  const body = req.body || {};
  const prompt = body.prompt;
  const model = body.model || 'gemini-2.0-flash';

  if (!prompt) {
    res.status(400).json({ error: 'No prompt provided' });
    return;
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.9 }
      })
    });

    const data = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (e) {
    res.status(500).json({ error: 'Proxy error: ' + (e.message || String(e)) });
  }
};
