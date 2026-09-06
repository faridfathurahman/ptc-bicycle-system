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

    // Waktu Jepang
    const now = new Date();

    const japan = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Tokyo"
      })
    );

    const currentMinutes =
      japan.getHours() * 60 +
      japan.getMinutes();

    console.log("Server Time:", now.toString());
    console.log("Japan Time:", japan.toString());
    console.log(
      "Current Time:",
      japan.getHours() + ":" + japan.getMinutes()
    );
    console.log("Current Minutes:", currentMinutes);

    // LINE pribadi + LINE grup
    const targets = [
      "Ud7e29225e426ea4d509d2edac5384028",
      "Cb343324b7e166cb4b80e1e1cb8670aa7"
    ];

    for (const doc of snapshot.docs) {
      const bike = doc.data();

      console.log("==========");
      console.log("Bike:", bike.name);
      console.log("Status:", bike.status);
      console.log("ETA:", bike.estimatedEndTime);
      console.log("Notified:", bike.overdueNotified);

      if (bike.status !== "borrowed") continue;

      if (
        !bike.estimatedEndTime ||
        bike.estimatedEndTime === "-"
      ) {
        continue;
      }

      if (bike.overdueNotified) continue;

      const parts = bike.estimatedEndTime.split(":");

      const etaMinutes =
        parseInt(parts[0]) * 60 +
        parseInt(parts[1]);

      console.log("Current Minutes:", currentMinutes);
      console.log("ETA Minutes:", etaMinutes);

      if (currentMinutes >= etaMinutes) {

        console.log("OVERDUE:", bike.name);

        const message =
`🚨 自転車返却遅延 / Bicycle Overdue

Bike : ${bike.name}
User : ${bike.borrowedBy}

Status:
🔴 Overdue / 返却遅延`;

        let allSuccess = true;

        // Kirim ke LINE pribadi dan grup
        for (const target of targets) {

          try {

            const response = await fetch(
              "https://api.line.me/v2/bot/message/push",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization":
                    "Bearer " +
                    process.env.LINE_CHANNEL_ACCESS_TOKEN
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

            const responseText =
              await response.text();

            console.log(
              "LINE Target:",
              target
            );

            console.log(
              "LINE Status:",
              response.status
            );

            console.log(
              "LINE Response:",
              responseText
            );

            if (!response.ok) {
              allSuccess = false;
            }

          } catch (lineError) {

            console.error(
              "LINE Send Error:",
              lineError
            );

            allSuccess = false;
          }
        }

        // Hanya update jika semua LINE berhasil
        if (allSuccess) {

          await doc.ref.update({
            overdueNotified: true
          });

          console.log(
            "Overdue notification completed:",
            bike.name
          );

        } else {

          console.log(
            "Overdue notification failed. Will retry:",
            bike.name
          );
        }
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
