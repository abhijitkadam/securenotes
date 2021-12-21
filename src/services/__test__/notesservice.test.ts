import { OrderedMap } from 'immutable';

import { addNote, deleteNote, listNotesFromProfile, getNote } from './../notesservice';
import { NoteData, Field } from './../../models/note';


import { FirebaseUtil } from "../../firebase/firebase";


jest.setTimeout(30000);

beforeAll(async () => { 
    
    
    await FirebaseUtil.logInUser();        
})

afterAll(async () => {
    try {
        await FirebaseUtil.logOutUser();
    } catch (error) {
        console.log(error);
        
    }
   
})

// it("note basic", ()=> {
//     expect("1").toBe("1")
// });

it("add_note", async () => {
    const uid = FirebaseUtil.getCurrentUser();
    let n1 : NoteData = {title:"ICICI PRU Arb",fields: {}, profileid:"sss", type:"MF", author:uid};
    n1.fields["folioid"] = "AAddassas1212";

    let n2 : NoteData = {title:"hdfc bank",fields: {}, profileid:"n2sss", type:"Bank", author:uid} ;
    n2.fields["accountid"] = "343442323";

    await addNote("LBZ3PLYniNjWx9bfLGUB", n1);
    await addNote("c0FMXRKviY3cuPu756vj", n2);
});

it("delete_note", async () => {
    await deleteNote("AIAnZKsjEaaCfK8FNUlJ");
    await deleteNote("vLCqQLEdezI6YHvfhlm8");
   
});

it("list_notes_from_profile", async () => {
    const notesMap = await listNotesFromProfile("LBZ3PLYniNjWx9bfLGUB");
    const notes = notesMap.valueSeq().toArray();
    console.log(notes);    
    //console.log(Object.keys(n.data.fields));
    // const l = n.data.fields["folioid"];
    // console.log(typeof l);   
    
});

it("get_note", async () => {
    
    const n2 = await getNote("vzbMsDvAHiAcqwNeIiFw");
    console.log(n2);
    
});



