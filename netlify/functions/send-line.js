exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    const body = JSON.parse(event.body);
    const message = body.message;

    const targets = [
      "Ud7e29225e426ea4d509d2edac5384028",
      "Cb343324b7e166cb4b80e1e1cb8670aa7"
    ];

    const results = [];

    for (const target of targets) {
      const response = await fetch(
        "https://api.line.me/v2/bot/message/push",
        {
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
        }
      );

      const responseText = await response.text();

      console.log("LINE Target:", target);
      console.log("LINE Status:", response.status);
      console.log("LINE Response:", responseText);

      results.push({
        target: target,
        status: response.status,
        response: responseText
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Send completed",
        results: results
      })
    };

  } catch (error) {
    console.error("ERROR:", error);

    return {
      statusCode: 500,
      body: error.toString()
    };
  }
};
