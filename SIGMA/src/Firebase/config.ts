// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAbWLH8Od20R3ApYnxwFCQp4JCMYjHbeSY",
    authDomain: "sigma-b35a7.firebaseapp.com",
    projectId: "sigma-b35a7",
    storageBucket: "sigma-b35a7.firebasestorage.app",
    messagingSenderId: "784796271162",
    appId: "1:784796271162:web:1be575cdf51fcb7943ab03",
    measurementId: "G-KH1X9GFLXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firebaseStorage = getStorage(app);
const db = getFirestore();

export {app, auth, firebaseStorage, db}