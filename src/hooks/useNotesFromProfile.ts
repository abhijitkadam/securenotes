import { getDefaultProfile } from './../services/profileservice';
import { OrderedMap } from 'immutable';
import { useReducer, useEffect, useState } from 'react';
import { Note, NoteData } from './../models/note';
import {query, collection, onSnapshot, getFirestore} from 'firebase/firestore';
import { useAuth } from '../providers/authprovider';


// export type NotesState = {
//     state: "loading" | "loaded" | "reset",
//     notes:OrderedMap<string, Note>
// }



export type ProfileNotes = {
    key:"profile",
    initialload:boolean,
    profileid:string
    notes:OrderedMap<string, Note>,
}
export type ProfileStateEmpty = {
    key:"empty"
};
export type ProfileState = ProfileStateEmpty | ProfileNotes

let initialState:ProfileState = {key:"empty"};



type Action = {
    type: "added" | "removed" | "modified" | "reset" | "profile" | "loaded",
    note?: Note,
    profileid?:string,
}

const reducer = (state: ProfileState, action: Action): ProfileState => {

    switch (action.type) {
        case "profile":
            if(action.profileid)
            state = {key:"profile", initialload:false, profileid:action.profileid, notes:OrderedMap<string, Note>()}
            return {...state};
        case "loaded":
            if(state.key === "profile" && action.profileid === state.profileid)
                return {...state, initialload:true}
        return state;
        case "added":
        case "modified":
            if (action.note && state.key === "profile")
                state.notes = state.notes.set(action.note.id, action.note);
           return {...state};
        case "removed":
            if (action.note && state.key === "profile")
                state.notes = state.notes.remove(action.note.id) 
           return {...state};
        case "reset":
            return initialState;
        default:
            return {...state};
    }

}

export type DefaultProfile={
    key:"defaultprofile"
};
export type Profile={
    key:"profile",
    id:string,
};
export type NoProfile = {
    key:"noprofile"
}

export type ProfileInput = NoProfile | DefaultProfile | Profile

export const useNotesFromProfile = (profileid:string) => {

    const [profileState, dispatch] = useReducer(reducer, initialState);
    const {authState} = useAuth();
    

    useEffect(() => {

        if (authState.key=== "loaded" && authState.state.key === "user" && profileid){
            const profilePath = `/users/${authState.state.user.uid}/profiles/${profileid}/notes`; 
           const db = getFirestore();
            const q = query(collection(db, profilePath));
            dispatch({type:"profile", profileid:profileid});
            const unsubscribe = onSnapshot(q, (snapshot) => {      
                
                snapshot.docs.forEach(d => {
                    dispatch({type:"added", note: {id:d.id, data: d.data() as NoteData}});
                });
                dispatch({type:"loaded", profileid:profileid});
                
                snapshot.docChanges().forEach((change) => {                  
                        if (change.type === "added") {
                            dispatch({type:"added", note: {id:change.doc.id, data: change.doc.data() as NoteData}});                    
                        }
                        if (change.type === "modified") {
                            dispatch({type:"modified", note: {id:change.doc.id, data: change.doc.data() as NoteData}});
                        }
                        if (change.type === "removed") {
                            dispatch({type:"removed", note: {id:change.doc.id, data: change.doc.data() as NoteData}});
                        }
                    });
            }, (error) => {
                console.log(error);
                
              });

            return () => {                
                unsubscribe();
                dispatch({type:"reset"});
                console.log("unsub & reset");
                                
            }
        }
        
    }, [profileid, authState]);

    return {profileState};

}

export const useNotesFromProfile2 = () => {

    const [profileState, dispatch] = useReducer(reducer, initialState);
    const {authState, isUserState} = useAuth();
    const [profileid, setprofileid] = useState<ProfileInput>({key:"noprofile"});

    // const getProfileid = async (profileid: DefaultProfile | Profile) => {
    //     if(profileid.key === "profile") return profileid.id;
    //     return await getDefaultProfile();
    // }

    const trySetProfile = async (profilein:ProfileInput) => {
        if(isUserState()){
            if(profilein.key === "defaultprofile"){
                const profile = await getDefaultProfile();
                profilein = {key:"profile","id":profile};
            }
    
            if(profilein.key === "profile"){
                if(profileState.key === "profile" && profileState.profileid === profilein.id){
                    return;                
                }
                dispatch({type:"profile", profileid:profilein.id});
                setprofileid(profilein);   
            }
        }
    }


    useEffect(() => {

        if (authState.key=== "loaded" && authState.state.key === "user" && profileid.key === "profile"){
            const profilePath = `/users/${authState.state.user.uid}/profiles/${profileid.id}/notes`; 
           const db = getFirestore();
            const q = query(collection(db, profilePath));
            const unsubscribe = onSnapshot(q, (snapshot) => {                                
                
                snapshot.docChanges().forEach((change) => {                  
                        if (change.type === "added") {
                            dispatch({type:"added", note: {id:change.doc.id, data: change.doc.data() as NoteData}});                    
                        }
                        if (change.type === "modified") {
                            dispatch({type:"modified", note: {id:change.doc.id, data: change.doc.data() as NoteData}});
                        }
                        if (change.type === "removed") {
                            dispatch({type:"removed", note: {id:change.doc.id, data: change.doc.data() as NoteData}});
                        }
                    });
            }, (error) => {
                console.log(error);
                
              });

            return () => {                
                unsubscribe();
                dispatch({type:"reset"});
                console.log("unsub & reset");
                                
            }
        }
        
    }, [profileid, authState]);

    return {profileState, trySetProfile};

}