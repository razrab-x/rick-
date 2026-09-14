module.exports = async function handler(req, res) {
  console.log('=== NEW REQUEST ===');
  console.log('Method:', req.method);

  if (req.method !== 'POST') {
    console.log('Wrong method, returning 405');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_KEY;
  console.log('Key exists:', !!apiKey);
  console.log('Key length:', apiKey ? apiKey.length : 0);

  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_KEY not configured' });
    return;
  }

  const body = req.body || {};
  const prompt = body.prompt;
  const model = body.model || 'gemini-3.8-flash';

  console.log('Model:', model);
  console.log('Prompt length:', prompt ? prompt.length : 0);

  if (!prompt) {
    res.status(400).json({ error: 'No prompt provided' });
    return;
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
  console.log('URL:', url.replace(apiKey, 'KEY_HIDDEN'));

  try {
    console.log('Fetching Google...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.9 }
      })
    });

    console.log('Google status:', response.status);
    const data = await response.text();
    console.log('Response length:', data.length);
    console.log('Response preview:', data.slice(0, 200));

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (e) {
    console.log('EXCEPTION:', e.message);
    console.log('STACK:', e.stack);
    res.status(500).json({ error: 'Proxy error: ' + (e.message || String(e)) });
  }
};
