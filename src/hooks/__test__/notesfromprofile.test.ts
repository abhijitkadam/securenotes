/**
 * @jest-environment jsdom
 */
import { useNotesFromProfile } from './../useNotesFromProfile';
import { FirebaseUtil } from "../../firebase/firebase";
import { renderHook } from '@testing-library/react-hooks'
import {query, collection, onSnapshot, getFirestore} from 'firebase/firestore';
beforeAll(async () => {
    await FirebaseUtil.logInUser();        
})

 jest.setTimeout(5000);

afterAll(async () => {
    try {
        await FirebaseUtil.logOutUser();
    } catch (error) {
        console.log(error);
        
    }   
})
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("listen_notes_from_profile", async ()=> {
    const uid = FirebaseUtil.getCurrentUser();
    const profileid = "LBZ3PLYniNjWx9bfLGUB";

    const {result, waitForNextUpdate} = renderHook(() => useNotesFromProfile(profileid, uid));

    console.log(result.current.valueSeq().toArray());
    //await delay(2000);
    await waitForNextUpdate({timeout:2000});
    console.log(result.current.valueSeq().toArray());
    // await waitForNextUpdate({timeout:false});
    // console.log(result.current.valueSeq().toArray());


    // const db = getFirestore();
    //         const profilePath = `/users/${uid}/profiles/${profileid}/notes`; 
    //         console.log(profilePath);
            
    //         const q = query(collection(db, profilePath));
    //         const unsubscribe = onSnapshot(q, (snapshot) => {                
    //             snapshot.forEach((doc) => {
    //                 console.log(doc);
                    
    //             });
    //             snapshot.docChanges().forEach((change) => {
    //                 console.log(change.type);
                    
    //                     // if (change.type === "added") {
    //                     //     dispatch({type:"added", note: {id:change.doc.id, data: change.doc.data() as NoteData}});                    
    //                     // }
    //                     // if (change.type === "modified") {
    //                     //     dispatch({type:"modified", note: {id:change.doc.id, data: change.doc.data() as NoteData}});
    //                     // }
    //                     // if (change.type === "removed") {
    //                     //     dispatch({type:"removed", note: {id:change.doc.id, data: change.doc.data() as NoteData}});
    //                     // }
    //                 });
    //         }, (error) => {
    //             console.log(error);
                
    //           });

              //await delay(3000);
                  
});

