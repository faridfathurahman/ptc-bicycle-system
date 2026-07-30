const admin = require("firebase-admin");
const fetch = require("node-fetch");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

exports.handler = async () => {
  try {

    const snapshot = await db.collection("Bikes").get();

    const now = new Date();
    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    for (const doc of snapshot.docs) {

      const bike = doc.data();

      if (bike.status !== "borrowed") continue;

      if (!bike.estimatedEndTime || bike.estimatedEndTime === "-") continue;

      if (bike.overdueNotified) continue;

      const parts = bike.estimatedEndTime.split(":");

      const etaMinutes =
        parseInt(parts[0]) * 60 +
        parseInt(parts[1]);

      if (currentMinutes >= etaMinutes) {

        console.log(`${bike.name} is overdue`);

     await doc.ref.update({
  overdueNotified: true
});

await fetch("https://api.line.me/v2/bot/message/push", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization":
      "Bearer " + process.env.LINE_CHANNEL_ACCESS_TOKEN
  },
  body: JSON.stringify({
    to: "Ud7e2925e426ea4d509d2edac5384028",
    messages: [
      {
        type: "text",
        text:
`🚨 Bicycle Overdue
🚨 自転車返却遅延

Bike : ${bike.name}
User : ${bike.borrowedBy}

Status:
🔴 Overdue / 返却遅延`
      }
    ]
  })
});

      }
    }

    return {
      statusCode: 200,
      body: "OK"
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: err.toString()
    };
  }
};
