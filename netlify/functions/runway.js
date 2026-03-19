exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.RUNWAYML_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'RUNWAYML_API_KEY not set' }) };

  let parsed;
  try {
    parsed = JSON.parse(event.body || '{}');
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action, taskId, body: reqBody } = parsed;

  try {
    let url, method = 'POST', fetchBody;

    if (action === 'create') {
      // Use text-to-video endpoint instead
      url = 'https://api.dev.runwayml.com/v1/text_to_video';
      fetchBody = JSON.stringify({
        promptText: reqBody.promptText,
        model: 'gen4.5',
        ratio: '1280:720',
        duration: reqBody.duration || 5,
        seed: reqBody.seed || Math.floor(Math.random() * 9999)
      });
    } else if (action === 'status') {
      url = `https://api.dev.runwayml.com/v1/tasks/${taskId}`;
      method = 'GET';
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action: ' + action }) };
    }

    const fetchOpts = {
      method,
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      }
    };
    if (method === 'POST') fetchOpts.body = fetchBody;

    const res = await fetch(url, fetchOpts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    return { statusCode: res.status, headers, body: JSON.stringify(data) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
