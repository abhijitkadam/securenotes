import React from "react";

import { getNote } from './../services/notesservice';
import { collection, onSnapshot } from 'firebase/firestore';
import { query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useEffect } from 'react';
import { useReducer } from 'react';
import { Note } from './../models/note';

import { useAuth } from "./authprovider";


import FlexIndexer from '../services/flexindexer';



export type NoteDoc = {
    indexid:string,
    profileid:string,
    noteid: string,
    title:string,
}

// function termFilter(term: string) {
//     return term.toLowerCase();
//   }
  
//   const tokenizer = (s: string) => s.split(" ");

// function createDocumentIndex(fields: any) {
//     // `createIndex()` creates an index data structure.
//     // First argument specifies how many different fields we want to index.
//     const index = createIndex(fields.length);
//     // `fieldAccessors` is an array with functions that used to retrieve data from different fields. 
//     const fieldAccessors = fields.map((f: any) => (doc:any) => doc[f.name]);
//     // `fieldBoostFactors` is an array of boost factors for each field, in this example all fields will have
//     // identical factors.
//     const fieldBoostFactors = fields.map(() => 1);
//     const removed = new Set();

//     var searchDocs = OrderedMap<string, NoteDoc>();

//     return {
//       // `add()` function will add documents to the index.
//       add: (doc:any) => {

//         let noteindexid = doc.profileid+ "_" + doc.id;
//         addDocumentToIndex(
//           index,
//           fieldAccessors,
//           // Tokenizer is a function that breaks text into words, phrases, symbols, or other meaningful elements
//           // called tokens.
//           // Lodash function `words()` splits string into an array of its words, see https://lodash.com/docs/#words for
//           // details.
//         //   words,
//         tokenizer,
//           // Filter is a function that processes tokens and returns terms, terms are used in Inverted Index to
//           // index documents.
//           termFilter,
//           // Document key, it can be a unique document id or a refernce to a document if you want to store all documents
//           // in memory.
//           noteindexid,
//           // Document.
//           doc,
//         );

//         searchDocs = searchDocs.set(noteindexid, {indexid: noteindexid,profileid:doc.profileid, noteid:doc.id, title:doc.title});
//       },
//       remove: (profileid: string, id: string) => {
//         let noteindexid = profileid+ "_" + id;
//         removeDocumentFromIndex(index, removed, noteindexid);
//         // When document is removed we are just marking document id as being removed. And here we are using a simple
//         // heuristic to clean up index data structure when there are more than 10 removed documents.
//         if (removed.size > 10) {
//           vacuumIndex(index, removed);
//         }

//         searchDocs.remove(noteindexid);

//       },
//       // `search()` function will be used to perform queries.
//       search: (q:string):NoteDoc[] => {

//         let results = 
//         ndxquery(
//             index,
//             fieldBoostFactors,
//             // BM25 ranking function constants:
//             1.2,  // BM25 k1 constant, controls non-linear term frequency normalization (saturation).
//             0.75, // BM25 b constant, controls to what degree document length normalizes tf values.
//             words,
//             termFilter,
//             // Set of removed documents, in this example we don't want to support removing documents from the index,
//             // so we can ignore it by specifying this set as `undefined` value.
//             undefined, 
//             q.toLowerCase(),
//           );         
          

//           var notes: NoteDoc[] = [];
//           results.forEach(r => {
//             let note = searchDocs.get(r.key as string);
//             if(note){
//                 notes.push(note);
//             }
//           });

//           return notes;
//       },
//     };
//   }

// export type NotesIndex = {
//     index: Document,
//     search: (term:string)=> Note[]
// }

export type NotesIndex = {
    index: any,
    search: (term:string)=> any[]
}



// let notesIndex: NotesIndex = {
//     index:new Document({
//         tokenize: "full",
//         minlength:1,
//         store:true,
//         id: "id",
//         bool:"or",
//         index: ["title", "content"]
//     }),
//     search: (term:string): Note[] => {
//         let notes: Note[] = [];
//         let searchedResults =  notesIndex.index.search(term) as any[];

//         searchedResults.forEach(resSet => {
//             resSet.result.forEach((n: any) => {
//                 console.log(n);                
                
//             });
//         });
        
//         return notes;
//     } 
// }

let notesIndex: NotesIndex = {
    //index:createDocumentIndex([{ name: "title" },{ name: "content" }]),
    index:new FlexIndexer(),
    search: (term:string): any => {
        let results = notesIndex.index.search(term);
        //console.log(results);        
        
        return results;
    } 
}

type ActionAdd = {
    type: "added",
    note:Note,
}

type ActionModify = {
    type: "modified",
    note:Note,
}

type ActionRemoved = {
    type: "removed",
    id:string,
    profileid:string,
}

type ActionReset = {
    type: "reset",
}

type Action = ActionAdd | ActionModify | ActionRemoved | ActionReset

const reducer = (state:NotesIndex, action:Action):NotesIndex => {

    switch (action.type) {
        case "reset":
            //state.index = createDocumentIndex([{ name: "title" },{ name: "content" }]);
            state.index = new FlexIndexer();
            break;
        case "added" : 
        case"modified":
            const note = action.note;
            let noteKeys = note.data.fields.map(f => f.displayname).filter(k => !['id', 'password', 'type', 'title'].includes(k))
            noteKeys = noteKeys.concat(note.data.type.split("_"))
            let notekeysstr = noteKeys.join(" ");            
            let noteToIndex = {profileid: note.data.profileid, id: note.id, title: note.data.title.toLowerCase(), content: notekeysstr.toLowerCase()};
            if (action.type === "modified"){
                state.index.removeNote(note.data.profileid, note.id);
            } 
            state.index.indexNote(noteToIndex)
             
            break;
        case "removed" :
            state.index.removeNote(action.profileid, action.id);
            break;
        default:
            break;
    }
    //shallow copy the state object
    return {...state};

}

export const NotesIndexContext = React.createContext<NotesIndex>(null!);

export const NotesIndexProvider = ({children}:{children:React.ReactNode}) => {

    const [indexState, dispatch] = useReducer(reducer, notesIndex);
    let auth = useAuth();

    useEffect(() => {

        if (auth.authState.key === "loaded" && auth.authState.state.key === "user"){
            const db = getFirestore();
            const profilePath = `/users/${auth.authState.state.user.uid}/allnotes`; 
            
            const q = query(collection(db, profilePath));
            const unsubscribe = onSnapshot(q, (snapshot) => {                
                
                snapshot.docChanges().forEach(async (change) => {
                    
                        const id = change.doc.id;
                        if (change.type === "added") {
                            const noteInfo = change.doc.data() as {"profile": string};
                            const noteRes = await getNote(id, noteInfo.profile);
                            if(noteRes.ok){
                                dispatch({type:"added", note: noteRes.val});                    
                            } else {
                                console.log(noteInfo, " : ",noteRes.val.message);                                
                            }                            
                        }
                        if (change.type === "modified") {
                            const noteInfo = change.doc.data() as {"profile": string};
                            const noteRes = await getNote(id, noteInfo.profile);
                            if(noteRes.ok){
                                dispatch({type:"modified", note: noteRes.val});                    
                            } else {
                                console.log(noteRes.val.message);                                
                            }
                        }
                        if (change.type === "removed") {
                            const noteInfo = change.doc.data() as {"profile": string};
                            dispatch({type:"removed", id:id, profileid:noteInfo.profile});
                        }
                    });
            }, (error) => {
                console.log(error);
                
              });

        
            return () => {
                dispatch({type:"reset"});
                unsubscribe();
            }

        }
    }, [auth.authState])
  
    return <NotesIndexContext.Provider value={indexState}> {children}</NotesIndexContext.Provider>;

}

export const useNotesIndex = () => {
    return React.useContext(NotesIndexContext)
}