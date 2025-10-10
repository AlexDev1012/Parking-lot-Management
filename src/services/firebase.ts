// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: "",
  // authDomain: "cpmdashboard-92155.firebaseapp.com",
  // projectId: "cpmdashboard-92155",
  // storageBucket: "cpmdashboard-92155.appspot.com",
  // messagingSenderId: "845798661219",
  // appId: "1:845798661219:web:1977c00178c9a87942ac56",
  // measurementId: "G-TM46Q5WF8S",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
export const app = getApp();
export { onAuthStateChanged };
export const auth = getAuth(app);
