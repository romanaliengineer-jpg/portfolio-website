exports.handler = async (event) => {

  /* ── CORS preflight ── */
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  /* ── Only allow POST ── */
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  /* ── Check API key is set ── */
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in Netlify environment variables!');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        content: [{ text: '⚠️ Server error: GROQ_API_KEY is not configured. Go to Netlify → Site Configuration → Environment Variables and add it.' }]
      }),
    };
  }

  try {
    /* ── Parse request body ── */
    const { messages, system } = JSON.parse(event.body);

    /* ── Call Groq API ── */
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: system },
          ...messages,
        ],
      }),
    });

    /* ── Handle Groq error responses ── */
    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errBody);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          content: [{ text: `⚠️ Groq API error ${groqRes.status}: ${errBody}` }]
        }),
      };
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't respond right now!";

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ content: [{ text: reply }] }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        content: [{ text: '⚠️ Server error: ' + err.message }]
      }),
    };
  }
};