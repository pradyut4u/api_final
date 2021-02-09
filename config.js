import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyDs5qH61LrIlsfhtdq7aTLfcegv2FZ2h3Y",
  authDomain: "timer-b61f7.firebaseapp.com",
  databaseURL: "https://timer-b61f7.firebaseio.com",
  projectId: "timer-b61f7",
  storageBucket: "timer-b61f7.appspot.com",
  messagingSenderId: "1089546195781",
  appId: "1:1089546195781:web:8ade29d836593a5de1e42c"
};
// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
// please test 
// type error: firebase.default.firestore is not a function---same
// reopen the xpo mobile app an
//shall i strt?
// Initialize Firebase
//firebase.initializeApp(firebaseConfig);
if(!firebase.apps.length)
{
firebase.initializeApp(firebaseConfig)
}
//export default firebase.database()


export default firebase.firestore();
