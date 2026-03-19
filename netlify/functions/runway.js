exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { action, taskId, body: reqBody } = JSON.parse(event.body);
    const apiKey = process.env.RUNWAYML_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'RUNWAYML_API_KEY not set' }) };
    let url, method = 'POST', fetchBody;
    if (action === 'create') {
      url = 'https://api.dev.runwayml.com/v1/image_to_video';
      fetchBody = JSON.stringify(reqBody);
    } else if (action === 'status') {
      url = `https://api.dev.runwayml.com/v1/tasks/${taskId}`;
      method = 'GET';
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
    }
    const fetchOpts = { method, headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' } };
    if (method === 'POST') fetchOpts.body = fetchBody;
    const res = await fetch(url, fetchOpts);
    const data = await res.json();
    return { statusCode: res.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
