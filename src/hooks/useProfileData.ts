import { ProfileData } from './../models/profile';
import { OrderedMap } from 'immutable';
import { useEffect, useReducer } from "react"
import { Profile } from '../models/profile';

import {query, collection, onSnapshot, getFirestore} from 'firebase/firestore';

let initialState = OrderedMap<string, Profile>();

type Action = {
    type: "added" | "removed" | "modified",
    profile: Profile,
}

const reducer = (state: OrderedMap<string, Profile>, action: Action): OrderedMap<string, Profile> =>{
    switch (action.type) {
        case "added" || "modified":
            state = state.set(action.profile.id, action.profile);
           return state;
        case "removed":
            state = state.remove(action.profile.id) 
           return state;    
        default:
            return state;
    }
}

export const useProfileData = (user: string) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (user){
            const db = getFirestore();
            const profilesPath = `/users/${user}/profiles`; 
            const q = query(collection(db, profilesPath));
            const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    dispatch({type:"added", profile: {id:change.doc.id, data: change.doc.data() as ProfileData}});                    
                }
                if (change.type === "modified") {
                    dispatch({type:"modified", profile: {id:change.doc.id, data: change.doc.data() as ProfileData}});
                }
                if (change.type === "removed") {
                    dispatch({type:"removed", profile: {id:change.doc.id, data: change.doc.data() as ProfileData}});
                }
            });
            });

            return () => {                
                unsubscribe();                
            }
        }
        
    }, [user]);

    return state;
}