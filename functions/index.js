/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

var serviceAccount = require("./firebase_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwa-lern-52f8d-default-rtdb.firebaseio.com"
});

exports.storePostData = onRequest((request, response) => {
  // logger.info("Hello logs!", { structuredData: true });
  cors(request, response, () => {
    const { id, title, image, location } = request.body || {}
    admin.database().ref('posts')
      .push({
        id, title, image, location
      })
      .then(() => {
        response.status(201).json({
          message: 'Data stored',
          id
        })
      })
      .catch(error => {
        response.status(500).json({ error })
      })
  })
});
