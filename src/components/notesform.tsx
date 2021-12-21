import { useForm } from "react-hook-form";
import M from 'materialize-css';
import { useEffect, useState } from 'react';
import { Field, NoteData, NoteFields, } from '../models/note';
import { NoteTypeInfo } from "../models/notetypes";
import { v4 as uuidv4 } from 'uuid';
import { Result } from 'ts-results';


type NoteTypeInfoData = {
    key:"notetypeinfo",
    notetypeinfo:NoteTypeInfo,
}
type NoteFieldsData = {
    key:"notefields",
    notedata:NoteData,
}

type NoteDetailsData = NoteTypeInfoData | NoteFieldsData;


export const NotesFormAdd = ({notedetailsdata, onAddNote, encryptData}:
                                {
                                    notedetailsdata: NoteDetailsData, 
                                    onAddNote:(title:string,  type:string, noteFields: Field[]) => void,
                                    encryptData:(data: string) => Result<string, Error>
                                }
                            ) => {

    const { register, unregister, handleSubmit, formState: { errors } } = useForm<any>();

    const [fieldsState, setFieldsState] = useState<NoteFields>(() => notedetailsdata.key === "notetypeinfo" ? new NoteFields(notedetailsdata.notetypeinfo) : NoteFields.fromNoteData(notedetailsdata.notedata))

    const [showAddFieldForm, setShowAddFieldForm] = useState(false);

    const [disable, setDisable] = useState(false);

    useEffect(() => {
        M.updateTextFields();
        
    })

    useEffect(() => {
        setFieldsState(notedetailsdata.key === "notetypeinfo" ? new NoteFields(notedetailsdata.notetypeinfo) : NoteFields.fromNoteData(notedetailsdata.notedata));        
    }, [notedetailsdata])

    const onFormSubmit = async (fdata:any) => {
        
        var fields: Field[] =[];
        
        fieldsState.fields.valueSeq().toArray().forEach(f => {
            let encRes = encryptData(fdata[f.name]);
            if(encRes.ok){
                f.data = encRes.val;
            }
            fields.push(f);
        })
        await onAddNote(fdata.title, fieldsState.type, fields); 
       
    };

    const onClickShowAddFieldForm = (e:any) => {
        e.preventDefault();
        setShowAddFieldForm(true);
    }

    const onClickCancelAddFieldForm = () => {        
        setShowAddFieldForm(false);
    }

    const onClickAddField = (fieldForm:any) => {
        
        setShowAddFieldForm(false);

        let field: Field = {data:"", displayname: fieldForm.displayname, isFromTemplate:false, isNumber:false, name:uuidv4()}        

        setFieldsState(pfs => {
           
            pfs.addField(field)
            return Object.assign(new NoteFields(),pfs);
        })
        
        
    }

    const handleFormSubmit = async () => {
        setDisable(true);
        await handleSubmit(onFormSubmit)();
        setDisable(false);
    }

    const cancelField = (fieldname: string) => {
        setFieldsState(pfs => {
            let ret = pfs.removeField(fieldname);
            if(ret.ok){
                unregister(fieldname);
            }
            let t = Object.assign(new NoteFields(),pfs);
            return t;
        });

       
    }
    

    return (        
        <div>    
            <div onSubmit={handleSubmit(onFormSubmit)}>

                <div className="input-field">
                    {errors?.title?.type === "required" && <div>This field is required</div>}                    
                    {errors?.title?.type === "noteexists" && <div>Note with this title already exists</div>}                    
                    <input type="text" {...register("title", { required: true})} defaultValue={notedetailsdata.key === "notefields" ? notedetailsdata.notedata.title : ""}/>
                    <label>Title</label>
                </div>
               
                {fieldsState.fields.valueSeq().toArray().map(f => (
                    <div  key={f.name}>
                         <div className="row">
                              <div className="col s10 l10">
                                <div className="input-field">
                                <input type="text" {...register(f.name)} defaultValue={notedetailsdata.key === "notefields" ? fieldsState.fields.get(f.name)?.data : ""}/> 
                                <label>{f.displayname}</label>
                                </div>
                              </div>
                              {!f.isFromTemplate && (
                                  <div className="col s2 l2">
                                  <div className="waves-effect waves-light" onClick={() => cancelField(f.name)}><i className="material-icons">cancel</i></div>
                                  </div>
                              )}
                         </div>
                        
                    </div>
                    
                ))}               
                                    
                    <div>
                    <button  className="btn-floating waves-effect waves-light green" onClick={onClickShowAddFieldForm}>
                        <i className="material-icons">add</i>
                    </button>
                    </div>
                    <br/>
                    <CustomFieldForm showForm={showAddFieldForm} onClickAddField={onClickAddField} onClickCancelAddFieldForm={onClickCancelAddFieldForm}/>
                    
                    <br/>
                <div>
                    <button className="btn waves-effect waves-light" onClick={handleFormSubmit} disabled={disable}>Submit
                        <i className="material-icons right">save</i>
                    </button>
                </div>  
            </div>
                 
        </div>
    )

}

export const CustomFieldForm = ({showForm, onClickAddField, onClickCancelAddFieldForm}:{showForm:boolean, onClickAddField: (fieldForm:any)=>void, onClickCancelAddFieldForm: ()=> void}) => {

    const { register, handleSubmit, formState: { errors } } = useForm<any>();

    const onFormSubmit = (fdata:any) => onClickAddField(fdata);

    const handleFormSubmit = () => {
        handleSubmit(onFormSubmit)();
    }

    return (
        <>
        {showForm && (
            <>
            <div style={{padding:15, borderWidth:1, borderColor:"gray", borderStyle:"solid"}}>
                <div className="">
                    {errors?.displayname?.type === "required" && <div>This field is required</div>}
                    <label >New field name
                    <input type="text" {...register("displayname",{required:true})}/>
                    </label>
                </div>
                <div>
                <br />
                <button className="btn waves-effect waves-light" type="submit" onClick={handleFormSubmit}>
                    Add                            
                </button> 
                <button style={{marginLeft:20}} className="btn waves-effect waves-light red" onClick={onClickCancelAddFieldForm}>
                    close                            
                </button>
                </div>
            </div>
            </>
        )}
        </>
    )
}