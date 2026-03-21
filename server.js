const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

const serviceAccount = require("./service_account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.get("/health", (req, res) => {
  res.send({ status: "ok", time: new Date().toISOString() });
});

app.post("/send-alert", async (req, res) => {
  try {
    console.log("Request received:", JSON.stringify(req.body));

    const { token, title, body } = req.body;

    if (!token) {
      return res.status(400).send({ error: "Token is required" });
    }

    if (!title || !body) {
      return res.status(400).send({ error: "Title and body are required" });
    }

    console.log("Sending to token:", token.substring(0, 20) + "...");

    const message = {
      notification: {
        title: title,
        body: body
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channel_id: "wifi_monitor_alerts"
        }
      },
      token: token
    };

    const response = await admin.messaging().send(message);
    console.log("Message sent successfully:", response);

    res.send({ success: true, messageId: response });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});