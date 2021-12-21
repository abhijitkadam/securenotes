
import { OrderedMap } from 'immutable';
import {FirebaseUtil} from "../firebase/firebase";
import { QueryDocumentSnapshot, DocumentSnapshot, DocumentData, getFirestore, Firestore, serverTimestamp, Timestamp } from "firebase/firestore";
import { doc, collection, getDoc, getDocs, writeBatch } from "firebase/firestore"; 

import { NoteData, Note } from "../models/note";
import { Result, Err, Ok } from 'ts-results';



export const addNote = async (profileID: string, data: NoteData): Promise<Result<Note, Error>> => {

    try {
        const db = getFirestore();
        const batch = writeBatch(db);
        const uid = FirebaseUtil.getCurrentUser();
        const profilePath = `/users/${uid}/profiles/${profileID}`;
        const allNotesPath = `/users/${uid}/allnotes`;
        const noteDoc =  doc(collection(db,`${profilePath}/notes`));
        const allNotesIDDoc = doc(collection(db,allNotesPath), noteDoc.id);
        batch.set(noteDoc, Object.assign(data, {timestamp:serverTimestamp()}));
        batch.set(allNotesIDDoc,{"profile":profileID}); 
        await batch.commit();   
        return Ok({id:noteDoc.id, data:data});
    } catch (error) {
        return Err(error as Error)
    }
    
};


export const deleteNote = async (noteID: string, profile: string = ""): Promise<Result<void, Error>> => {

    try {
        const db = getFirestore();    
        const uid = FirebaseUtil.getCurrentUser();   
        const allNotesPath = `/users/${uid}/allnotes`;
        if (profile === ""){
            const profileRes = await getProfileIDOfNote(db, uid, noteID);
            if (profileRes.ok) {
                profile = profileRes.val;
            } else {
                return profileRes;
            }        
        }
        const batch = writeBatch(db);
        batch.delete(doc(db, allNotesPath, noteID));
        const profileNotesPath = `/users/${uid}/profiles/${profile}/notes`;
        batch.delete(doc(db, profileNotesPath, noteID))
    
        await batch.commit();
        return Ok.EMPTY;        
    } catch (error) {
        return Err(error as Error)        
    }
}

export const modifyNote = async (noteID: string, data: NoteData, profile: string = ""): Promise<Result<Note, Error>> => {

    try {
        const uid = FirebaseUtil.getCurrentUser();
        if (uid === null) return FirebaseUtil.noAuthUserPromise()
        const db = getFirestore();  
        if (profile === ""){
            const profileRes = await getProfileIDOfNote(db, uid, noteID);
            if (profileRes.ok) {
                profile = profileRes.val;
            } else {
                return profileRes;
            }
        }
        const profilePath = `/users/${uid}/profiles/${profile}`;    
        const batch = writeBatch(db);
        const allNotesPath = `/users/${uid}/allnotes`;
        const noteDoc =  doc(collection(db,`${profilePath}/notes`), noteID);
        const allNotesIDDoc = doc(collection(db,allNotesPath), noteID);
        batch.set(noteDoc, Object.assign(data, {timestamp:serverTimestamp()}));        
        batch.set(allNotesIDDoc,Object.assign({"profile":profile}, {timestamp:serverTimestamp()})); 
        await batch.commit(); 
        return Ok({id:noteDoc.id, data:data});
        
    } catch (error) {
        return Err(error as Error)
    }
};


export const getNote = async (noteid: string, profile: string = ""): Promise<Result<Note, Error>> => {

    try {
        const uid = FirebaseUtil.getCurrentUser();
        if (uid === null) return FirebaseUtil.noAuthUserPromise()
        const db = getFirestore();
        if (profile === ""){
            const profileRes = await getProfileIDOfNote(db, uid, noteid);
            if (profileRes.ok) {
                profile = profileRes.val;
            } else {
                return profileRes;
            }
        }                  
        const notesPath = `/users/${uid}/profiles/${profile}/notes`;
        const docRef = doc(db, notesPath, noteid);
        const notedoc = await getDoc(docRef);
        console.log(docRef.path);
        
        let note: Note = constructNoteFromDocument(notedoc);
        return Ok(note);        
    } catch (error) {
        return Err(error as Error)
    }
}

export const listNotesFromProfile = async (profile: string): Promise<Result<OrderedMap<string, Note>, Error>> => {
    const uid = FirebaseUtil.getCurrentUser();
    const profilePath = `/users/${uid}/profiles/${profile}`;
    try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, `${profilePath}/notes`));
        var notes = OrderedMap<string, Note>();       
        
        querySnapshot.forEach(doc => {
            let note: Note = constructNoteFromDocument(doc);            
            notes = notes.set(note.id, note);            
        });        
        return Ok(notes);        
    } catch (error) {        
        return Err(error as Error)
    }  
};



function constructNoteFromDocument(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>) {
    const docData = doc.data() as DocumentData;
    let time = docData["timestamp"] as Timestamp
    let noteData: NoteData = {
        title: docData["title"],
        type: docData["type"],
        profileid: docData["profileid"],
        author: docData["author"],
        timestamp: time ? time.toDate() : undefined,
        fields: docData["fields"],
    };

    let note: Note = {
        id: doc.id,
        data: noteData,
    };
    return note;
}

async function getProfileIDOfNote(db: Firestore, uid: string, noteID: string): Promise<Result<string, Error>> {
    try {
        const allNotesPath = `/users/${uid}/allnotes`;
        const docRef = doc(db, allNotesPath, noteID);
        const notedoc = await getDoc(docRef);
        const note = notedoc.data() as DocumentData;
        return Ok(note["profile"] as string);        
    } catch (error) {
        return Err(error as Error)
    }
}
