exports.handler = async (event) => {
  // Hanya menerima POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: "OK"
    };
  }

  const body = JSON.parse(event.body);

  console.log("LINE Webhook:", JSON.stringify(body));

  // Balas sukses agar Verify berhasil
  return {
    statusCode: 200,
    body: "OK"
  };
};
