import { Profile, ProfileData } from './../models/profile';
import {FirebaseUtil} from "../firebase/firebase";

import {getFirestore, doc, getDoc, writeBatch, collection, setDoc, addDoc, deleteDoc, getDocs } from "firebase/firestore";

export const getDefaultProfile = async (): Promise<string> => {
    const uid = FirebaseUtil.getCurrentUser(); 
    const db = getFirestore();
    const profileRef = doc(db,"users", `${uid}`)

    const docSnap = await getDoc(profileRef);

    if (docSnap.exists()) {
        return docSnap.data().defaultProfile;
    } else {
        const defaultProfile: ProfileData = {
            name:"Main Profile",
            description:"Main is the default profile",
        };
        const batch = writeBatch(db);
        const profileRef = doc(collection(db,`/users/${uid}/profiles`));
        batch.set(profileRef, defaultProfile);
        batch.set(doc(db,`/users/${uid}`), {defaultProfile:profileRef.id}, { merge: true });
        await batch.commit();        
        return profileRef.id;        
    }
}

export const setDefaultProfile = async (profileID: string) => {
    const uid = FirebaseUtil.getCurrentUser();
    const db = getFirestore();
    await setDoc(doc(db,`/users/${uid}`),{defaultProfile: profileID}, { merge: true });
};


export const addProfile = async (data : ProfileData) => {    
    const uid = FirebaseUtil.getCurrentUser();
    const db = getFirestore();
    const profileDoc = await addDoc(collection(db,`/users/${uid}/profiles`), data);
    return profileDoc;
};

export const ModifyProfile = async (profile: Profile) => {    
    const uid = FirebaseUtil.getCurrentUser();
    const db = getFirestore();
    const profileDoc = await setDoc(doc(db,`/users/${uid}/profiles/${profile.id}`), profile.data, { merge: true });
    return profileDoc;
};

export const getProfile = async(profileID: string) => {
    const uid = FirebaseUtil.getCurrentUser();
    const db = getFirestore();
    const docRef = doc(db, `/users/${uid}/profiles`, profileID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return  docSnap.data();
    } else {
        throw new Error("No such document!");
    }
};

//TODO: should delete notes from all notes
export const deleteProfile = async (profileID: string) => {
    const uid = FirebaseUtil.getCurrentUser();
    const db = getFirestore();
    const defaultProfileID = await getDefaultProfile();
    if (defaultProfileID === profileID) {
        throw new Error("Cannot delete default profile")
    }    
    const profilePath = `/users/${uid}/profiles/${profileID}`;
    return deleteDoc(doc(db, profilePath));
};

export const getAllProfiles = async () => {
    const uid = FirebaseUtil.getCurrentUser();
    const db = getFirestore();    
    const profilesPath = `/users/${uid}/profiles`;    
    try {
        const querySnapshot = await getDocs(collection(db, profilesPath));
        var profiles: Profile[] = [];
        
        querySnapshot.forEach(doc => profiles.push({id:doc.id, data:doc.data() as ProfileData}));        
        return profiles;        
    } catch (error) {
        throw error;
    }    
}