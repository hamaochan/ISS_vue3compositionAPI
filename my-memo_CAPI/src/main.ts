import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

// import * as firebase from "firebase/app"; ← TypeScriptでは型のインポートができない
import firebase from 'firebase/app'
import "firebase/firestore" 
import "firebase/auth"

const app = createApp(App); // アプリの生成

const firebaseConfig = {

};


firebase.initializeApp(firebaseConfig); // Firebase全体の初期化

const db = firebase.firestore(); // Firestoreインスタンスの初期化
app.config.globalProperties.db = db;

const auth = firebase.auth(); // Authenticationインスタンスの初期化
app.config.globalProperties.auth = auth;

app.mount('#app'); // アプリのマウント