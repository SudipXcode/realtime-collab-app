import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDB3L6Q9OA5jbwGGSjGD9Fzg08XsgMrVgM",
  authDomain: "realtime-collabe-app.firebaseapp.com",
  projectId: "realtime-collabe-app",
  appId: "1:372562212194:web:c6215f7d314ff32383e83b",

};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
