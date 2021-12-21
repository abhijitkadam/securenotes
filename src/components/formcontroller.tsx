import React, { useCallback, useState } from "react";
import { Field, Note, NoteData } from "../models/note";
import { MUTUAL_FUND, NoteTypeInfo, NoteTypesData } from "../models/notetypes";
import { useSecureState } from "../providers/securestate";
import { addNote, modifyNote } from "../services/notesservice";
import { FieldsDisplay } from "./fieldsdisplay";
import { FormContainer, FormState } from "./formcontainer";
import { NotesFormAdd } from "./notesform";
import { SecurePasswordForm } from "./securepasswordform";
import { useNavigate } from "react-router-dom";

export const FormController = ({note, formmode = "view"}:{note: Note, formmode?: FormState}) => {

    const [formstate, setFormstate] = useState<FormState>(formmode);

    const {secureState, InitSecureState, encryptData, decryptData} = useSecureState();

    let navigate = useNavigate();
    
    const toggleEditMode = () => {
        if(formstate === "edit") setFormstate("view")
        if(formstate === "view") setFormstate("edit")
    }

    const onAddNote = useCallback( async (title:string,  type:string, noteFields: Field[]) => {
            let noteData: NoteData = {
                ...note.data,
                fields:[],
                title:title,
                type:type,            
            };

            noteFields.forEach(f => {
                //noteData.fields[f.name] = f;
                noteData.fields.push(f);
            });
    
           let noteAddRes =  await modifyNote(note.id, noteData, note.data.profileid);
    
           if(noteAddRes.ok){
                navigate(`/dashboard/${note.data.profileid}`);
           }


        },
        [note, navigate],
    );

    const decryptNote = useCallback( (notedata: NoteData):NoteData => {            
            
            let noteDataPlain: NoteData = {...notedata, fields:[]};
            notedata.fields.forEach(f => {
                let decryptRes = decryptData(f.data);
                    if(decryptRes.ok){
                        noteDataPlain.fields.push({...f, data:decryptRes.val});
                    }
            });
            return noteDataPlain;
        },
        [decryptData],
    );

    return(
        <>
            {secureState.key !== "empty" && (
                <div></div>
            )}
            {secureState.key === "user" && (
                <SecurePasswordForm onSubmit={InitSecureState}/>
            )}

            {secureState.key === "secure" && (
            <FormContainer title={note.data.title} formstate={formstate} toggleEditMode={toggleEditMode}>
                    {formstate === "view" && <FieldsDisplay note={note} decryptData={decryptData}/>}
                    {formstate === "edit" && <NotesFormAdd notedetailsdata={{key:"notefields", notedata:decryptNote(note.data)}} onAddNote={onAddNote} encryptData={encryptData}/> }
            </FormContainer>
            )}
        </>
    )
}

export const FormControllerAdd = ({profileid}:{profileid:string}) => {

    const [noteFormTypeMeta, setNoteFormTypeMeta] = useState<NoteTypeInfo>(NoteTypesData.get(MUTUAL_FUND) as NoteTypeInfo)

    const {secureState, InitSecureState, encryptData} = useSecureState();
    
    let navigate = useNavigate();

    const onAddNote = async (title:string,  type:string, noteFields: Field[]) => {
        var noteData: NoteData = {
            title:title,
            type:type,
            profileid:profileid,
            author:"",
            fields:[]
        }

        noteFields.forEach(f => {
            //noteData.fields[f.name] = f;
            noteData.fields.push(f);
        });

       let noteAddRes =  await addNote(profileid, noteData);

       if(noteAddRes.ok){
        navigate(`/dashboard/${profileid}`);
       }
    } 

    return(
        <>
            {secureState.key !== "empty" && (
                <div></div>
            )}
            {secureState.key === "user" && (
                <SecurePasswordForm onSubmit={InitSecureState}/>
            )}
            {secureState.key === "secure" && (
                <div>
                    <select onChange={(e) => setNoteFormTypeMeta(NoteTypesData.get(e.target.value) as NoteTypeInfo)}>
                        {NoteTypesData.valueSeq().toArray().map(nt => <option key={nt.type} value={nt.type}>{nt.name}</option>)}
                    </select>
                    <br/> <br />
                    <NotesFormAdd notedetailsdata={{key:"notetypeinfo", notetypeinfo:noteFormTypeMeta}} onAddNote={onAddNote} encryptData={encryptData}/>
                </div>
            )}            
        </>
    )
}