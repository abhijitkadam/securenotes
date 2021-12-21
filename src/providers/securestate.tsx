import React from "react";
import { useState, useEffect } from 'react';
import { Ok, Err, Result } from 'ts-results';
import {keyFromPassword, getHash, isProfileHashInDBDifferent, decrypt, encrypt} from '../services/secure';
import { useAuth } from "./authprovider";

export type SecureStateEmpty = {
    key:"empty"
};

export type SecureStateUser = {
    key:"user",
    user:string,        
};

export type SecureStateReady = {
    key:"secure",
    user:string,
    hash: string,
    securekey: string,    
};

export type SecureState = SecureStateEmpty |  SecureStateUser | SecureStateReady;

export type SecureStateContextType = {
    secureState: SecureState,
    InitSecureState: (password: string)=> Promise<Result<boolean, Error>>,
    encryptData: (data: string) => Result<string, Error>,
    decryptData: (data: string) => Result<string, Error>    
}

export const SecureStateContext = React.createContext<SecureStateContextType>(null!);


export const SecureStateProvider = ({children}:{children:React.ReactNode}) => {

    const [secureState, setSecureState] = useState<SecureState>({key:"empty"});
    let auth = useAuth()

    useEffect(() => {
        if(auth.authState.key === "loaded" && auth.authState.state.key === "user"){
            setSecureState({key:"user", user:auth.authState.state.user.uid})
        } 
        
        return () => {
            setSecureState({key:"empty"});
        }
    }, [auth.authState])

    const InitSecureState = async (password: string):Promise<Result<boolean, Error>> => {

        if(secureState.key === "empty") {
            return Err(new Error('secureState user not set'));
        }

        const key = keyFromPassword(password, secureState.user);
        const hash = getHash(key, secureState.user);

        const hashIsDifferent = await isProfileHashInDBDifferent(hash)

        if(hashIsDifferent) return Ok(false);

        setSecureState({key:"secure", user:secureState.user, securekey:key, hash:hash})

        return Ok(true)
    }

    const encryptData = (data: string): Result<string, Error> => {
        if (secureState.key !== "secure") {
            return Err(new Error("key not set"));
        }
        return Ok(encrypt(secureState.securekey, data))
    }

    const decryptData = (data: string): Result<string, Error> => {
        if (secureState.key !== "secure") {
            return Err(new Error("key not set"));
        }

        return Ok(decrypt(secureState.securekey, data))
    }

    let value: SecureStateContextType = {secureState:secureState, InitSecureState, encryptData, decryptData};

    return <SecureStateContext.Provider value={value}> {children}</SecureStateContext.Provider>;
}

export function useSecureState() {
    return React.useContext(SecureStateContext);
}