import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
    apiKey: "AIzaSyBYm1SlMLG-JHVcBJ7WAFO5a4blDZI8kcM",
    authDomain: "react-slack-clone-ae218.firebaseapp.com",
    databaseURL: "https://react-slack-clone-ae218.firebaseio.com",
    projectId: "react-slack-clone-ae218",
    storageBucket: "react-slack-clone-ae218.appspot.com",
    messagingSenderId: "1028499580877",
    appId: "1:1028499580877:web:36cf0db94a447074c84684",
    measurementId: "G-DXRGRTD26D"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;