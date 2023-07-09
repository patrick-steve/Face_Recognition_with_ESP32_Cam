// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRAjKqiunFzj3-V4mDWqC_VvdNMP4wXFQ",
  authDomain: "esp-face.firebaseapp.com",
  projectId: "esp-face",
  storageBucket: "esp-face.appspot.com",
  messagingSenderId: "166178971531",
  appId: "1:166178971531:web:f7a07e25a5ea1fde75998e",
  measurementId: "G-3HDM6VW7Y8",
  databaseURL: "https://esp-face-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app)