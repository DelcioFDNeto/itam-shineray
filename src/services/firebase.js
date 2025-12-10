// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// COLOQUE SUAS CHAVES DIRETAMENTE AQUI (Substitua xxx pelos seus códigos do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyAJOXuOCafIgVIEqLSFzcDKnJS1i0HsA2I", 
  authDomain: "itam-shineray-label.firebaseapp.com",
  projectId: "itam-shineray-label",
  storageBucket: "itam-shineray-label.firebasestorage.app",
  messagingSenderId: "960139072578",
  appId: "1:960139072578:web:31b059c96e236b07c709db"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ... resto do código igual ...
export { db, auth };