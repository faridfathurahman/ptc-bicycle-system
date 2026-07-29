exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  const body = JSON.parse(event.body);
  const message = body.message;

  // Ganti nanti dengan Group ID setelah kita mendapatkannya
  const targets = [
    "Ud7e29225e426ea4d509d2edac5384028"
  ];

  for (const target of targets) {
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: target,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      })
    });
  }

  return {
    statusCode: 200,
    body: "OK"
  };
};
