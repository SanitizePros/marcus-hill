exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const { action, jobId, input } = JSON.parse(event.body);
    const apiKey = process.env.RUNPOD_API_KEY;
    const endpointId = process.env.RUNPOD_ENDPOINT_ID || 'rsp09b02pp0qy0';
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'RUNPOD_API_KEY not set' }) };
    let url, method = 'POST', reqBody;
    if (action === 'run') {
      url = `https://api.runpod.ai/v2/${endpointId}/run`;
      reqBody = JSON.stringify({ input });
    } else if (action === 'status') {
      url = `https://api.runpod.ai/v2/${endpointId}/status/${jobId}`;
      method = 'GET';
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
    }
    const fetchOpts = { method, headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' } };
    if (method === 'POST') fetchOpts.body = reqBody;
    const res = await fetch(url, fetchOpts);
    const data = await res.json();
    return { statusCode: res.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
