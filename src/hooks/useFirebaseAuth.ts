import { User, getAuth, signInWithRedirect, GoogleAuthProvider,onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

//https://firebase.google.com/docs/auth/web/google-signin?authuser=0
const provider = new GoogleAuthProvider();

export type AuthStateLoading = {
    key: "loading"
}

export type AuthStateError = {
    key: "autherror",
    error: string,
}

export type AuthStateUser = {
    key:"user",
    user:User | null,
}
export type AuthState = AuthStateLoading | AuthStateError | AuthStateUser;

const initialAuthState: AuthState = {key: "loading"};

export const useFirebaseAuth = ( auth = getAuth()) => {  

    const [authState, setAuthState] = useState<AuthState>(initialAuthState);

    useEffect(() => {

        const listener = 
        onAuthStateChanged(auth,         
          (user) => {                
              setAuthState({key:"user", user:user}); 
          }, 
          (error) => {
            setAuthState({key:"autherror", error:error.message});
          }
        );
  
        return () => {
          listener();
        }
      }, [auth])
  
      const login = async () => {
        const auth = getAuth();
        try {
          //await signInWithPopup(auth, provider);
          await signInWithRedirect(auth, provider);
          //await onLogin();
        } catch (error) {
          
        }      
      };
      
      const logout = () => {
        getAuth().signOut();
      };

      return {authstate: authState, login:login, logout:logout}

}