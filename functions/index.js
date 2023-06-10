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
const webPush = require('web-push');

const PUSH_PUBLIC_KEY = 'BBELZbbSF46Jo2cP-dDn2ijMfnCNKA6S-G5BF5lOttrI1-G7by007QanwLpgQI1qCpI9w2Kcr6UmszZz7HAq7Jk';
const PUSH_PRIVATE_KEY = '3VIbw-Y5EG_gIxz3XXCWpfPoxdIldO5YJtWYMlAeXVE'
const PUSH_EMAIL = 'mailto:mail@mail.pp'
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
      .push({ id, title, image, location })
      .then(() => {
        webPush.setVapidDetails(
          PUSH_EMAIL,
          PUSH_PUBLIC_KEY,
          PUSH_PRIVATE_KEY
        )

        return admin.database().ref('subscriptions').once('value');
      }).then((subscriptions) => {
        subscriptions.forEach(sub => {
          const pushConfig = { ...sub.val() };
          webPush.sendNotification(
            pushConfig,
            JSON.stringify({
              title: 'New Post',
              content: 'New Post added',
              openUrl: '/help'
            })
          )
            .catch(err => logger.error(err))
        })
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
