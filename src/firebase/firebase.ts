import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "@firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpxVq1ZafcYUMT53vgEUAKnYcWZkN_ErM",
  authDomain: "notes-56fb2.firebaseapp.com",
  projectId: "notes-56fb2",
  storageBucket: "notes-56fb2.appspot.com",
  messagingSenderId: "54521837705",
  appId: "1:54521837705:web:fba5b396f17e31c0a1ae58",
  measurementId: "G-5HPS9G40VZ"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const FirebaseUtil ={
    SUCCESS:"success",
    FAILURE:"failure",
    getCurrentUser(){
        const currentUser = getAuth().currentUser;
        if (currentUser === null) {
            throw new Error("unable to get the auth user");
        }
        return currentUser.uid
    },
    noAuthUserPromise(){
        return Promise.reject("Unable to get authenticated current user")
    },
    logInUser: async function() {
        try {
            const auth = getAuth();
            const user = await signInWithEmailAndPassword(auth, "akadam@cybage.com", "cybage@123");
            console.log(user.user.email);
            return {
                status: FirebaseUtil.SUCCESS,
                error: null,
            };
        } catch (error) {
            return {
                status: FirebaseUtil.FAILURE,
                error: error,
            }
        }
    },
    logOutUser: async function(){
        try {
            const auth = getAuth();
            await signOut(auth);
            return {
                status: FirebaseUtil.SUCCESS,
                error: null,
            };
        } catch (error) {
            return {
                status: FirebaseUtil.FAILURE,
                error: error,
            }
        } 
    }    
};


