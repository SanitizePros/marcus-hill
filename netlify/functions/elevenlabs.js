exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) return { statusCode: 500, body: JSON.stringify({ error: 'ElevenLabs env vars not set' }) };
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify(body)
    });
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: 'ElevenLabs error ' + res.status }) };
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ audio_base64: base64 }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
