export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(404).json({ error: 'No ElevenLabs API Key configured' });
  }

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  // Utilisation d'une voix professionnelle standard (ex: Rachel)
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; 

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      throw new Error(`TTS API Error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
