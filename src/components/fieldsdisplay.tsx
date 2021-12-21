import {Note} from "../models/note";
import { Result } from 'ts-results';
import { useCallback } from "react";
import copy from 'copy-to-clipboard';


export const FieldsDisplay = ({note, decryptData}:{note: Note, decryptData:(data:string)=> Result<string,Error>}) => {

    const copyfielddata = useCallback(
        (fname:string) => {
            note.data.fields.forEach(f => {
                if(f.name === fname){                    
                    copy(decryptData(f.data).val as string)
                }
            })
            
        },
        [note.data.fields, decryptData],
    )
    return (
        <>
            <ul className="collection">                  
                
                {note.data.fields.map(f => 
                    <li className="collection-item" key={f.name}>
                        <div className="blue-text text-darken-2">{f.displayname}</div>
                        <div>{decryptData(f.data).val}</div>
                        
                        <button onClick={() => copyfielddata(f.name)} className="waves-effect waves-light" style={{marginTop:"1rem"}}>
                            <i className="tiny material-icons">content_copy</i>
                        </button>
                    </li>
                )}
            </ul>
        </>
    )
}