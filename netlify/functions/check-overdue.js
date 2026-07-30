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

console.log("Server Time:", now.toString());
console.log("ISO:", now.toISOString());
    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();
console.log("Current Time:", now.getHours() + ":" + now.getMinutes());
    for (const doc of snapshot.docs) {

      const bike = doc.data();
console.log("==========");
console.log("Bike:", bike.name);
console.log("Status:", bike.status);
console.log("ETA:", bike.estimatedEndTime);
console.log("Notified:", bike.overdueNotified);

      if (bike.status !== "borrowed") continue;

      if (!bike.estimatedEndTime || bike.estimatedEndTime === "-") continue;

      if (bike.overdueNotified) continue;

      const parts = bike.estimatedEndTime.split(":");

      const etaMinutes =
        parseInt(parts[0]) * 60 +
        parseInt(parts[1]);
      console.log("Current Minutes:", currentMinutes);
console.log("ETA Minutes:", etaMinutes);

      if (currentMinutes >= etaMinutes) {

        console.log("SEND LINE:", bike.name);

     await doc.ref.update({
  overdueNotified: true
});

const response = await fetch("https://api.line.me/v2/bot/message/push", {
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
`🚨 自転車返却遅延 / Bicycle Overdue

Bike : ${bike.name}
User : ${bike.borrowedBy}

Status:
🔴 Overdue / 返却遅延`
      }
    ]
  })
});
console.log("LINE Status:", response.status);
console.log("LINE Response:", await response.text());
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
