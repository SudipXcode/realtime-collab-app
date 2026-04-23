import admin from "firebase-admin";
import serviceAccount from "../../config/realtime-collabe-app-firebase-adminsdk-fbsvc-f5862639f0.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccount as admin.ServiceAccount
    ),
  });
}

export default admin;
