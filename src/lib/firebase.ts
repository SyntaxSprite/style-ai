import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "styleai-pumdv",
  "appId": "1:869826962220:web:7d82daf2e658b15986c289",
  "storageBucket": "styleai-pumdv.firebasestorage.app",
  "apiKey": "AIzaSyCf-tpm9T8KOiEWOTs-DwTusoGoFfUSBAo",
  "authDomain": "styleai-pumdv.firebaseapp.com",
  "messagingSenderId": "869826962220"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// This configuration is crucial to prevent the "client is offline" error
// when the database hasn't been created in the Firebase console yet.
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
});

const auth = getAuth(app);

export { db, auth };
