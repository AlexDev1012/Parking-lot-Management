// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuVwU-iSzOYjYgAVo1hqhUrYuFGo-q3hs",
  authDomain: "citypark-9b7f2.firebaseapp.com",
  projectId: "citypark-9b7f2",
  storageBucket: "citypark-9b7f2.firebasestorage.app",
  messagingSenderId: "186912512039",
  appId: "1:186912512039:web:2c5f9009f2ee84e576d602",
  measurementId: "G-G9CN6TZP6H"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
export const app = getApp();
export { onAuthStateChanged };
export const auth = getAuth(app);
