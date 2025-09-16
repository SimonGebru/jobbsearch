
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { app, connectDB } = require("./app");


const MONGO_URI = defineSecret("MONGO_URI");


exports.api = onRequest(
  { region: "europe-west1", secrets: [MONGO_URI] },
  async (req, res) => {
    
    await connectDB();
 
    return app(req, res);
  }
);
