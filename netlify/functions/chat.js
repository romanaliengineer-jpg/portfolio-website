const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1"
});

exports.handler = async function(event) {

  const { message } = JSON.parse(event.body);

  const completion = await client.chat.completions.create({
    model: "grok-beta",
    messages: [
      { role: "user", content: message }
    ]
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: completion.choices[0].message.content
    })
  };
};