exports.handler = async (event) => {
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  const body = JSON.parse(event.body);

  const userId = body.userId;
  const message = body.message;

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    })
  });

  return {
    statusCode: response.status,
    body: await response.text()
  };
};
