const admin=require("firebase-admin");
const serviceAccount=require("./fsa.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;