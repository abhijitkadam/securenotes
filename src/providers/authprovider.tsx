import React from "react";
import { User, getAuth, Auth, signInWithRedirect, GoogleAuthProvider,onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router";

//https://firebase.google.com/docs/auth/web/google-signin?authuser=0
const provider = new GoogleAuthProvider();

export type AuthStateLoading = {
    key: "loading"
}

export type AuthStateError = {
    key: "autherror",
    error: string,
}
export type AuthStateNoUser = {
    key:"nouser",    
}

export type AuthStateUser = {
    key:"user",
    user:User,
}

export type AuthStateLoaded = {
    key:"loaded",
    state: AuthStateNoUser | AuthStateUser
}
export type AuthState = AuthStateLoading | AuthStateError | AuthStateLoaded;

const initialAuthState: AuthState = {key: "loading"};

export type AuthStateContextType = {
    authState: AuthState,
    login:() => Promise<void>,
    logout:() => Promise<void>,
    isUserState:()=>boolean,
}

export const AuthStateContext = React.createContext<AuthStateContextType>(null!);

export const AuthStateProvider = ({children, auth = getAuth()}:{children:React.ReactNode, auth:Auth}) => {

    const [authState, setAuthState] = useState<AuthState>(initialAuthState);

    useEffect(() => {
        const listener = 
        onAuthStateChanged(auth,         
          (user) => { 
              if(user){                
                    setAuthState({key:"loaded", state:{key:"user", user:user}});
              } else {
                    setAuthState({key:"loaded", state:{key:"nouser"}});          
              }
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
      
      const logout = async () => {
        await getAuth().signOut();
      };

      const isUserState = () => authState.key === "loaded" && authState.state.key === "user";

      let value: AuthStateContextType = {authState, login, logout, isUserState};

      return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>
}

export function useAuth() {
    return React.useContext(AuthStateContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }): JSX.Element {
    let auth = useAuth();
    let location = useLocation();
  
    if (auth.authState.key === "loaded" && auth.authState.state.key === "nouser") {

      return (<Navigate to="/" state={{ from: location }} />);
    }
  
    return <>{children}</>;
  }