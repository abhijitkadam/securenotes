import { useEffect, useState } from "react";
import Autocomplete from "react-autocomplete";
import { useNavigate } from "react-router-dom";
import { NoteDoc, useNotesIndex } from "../providers/notesindexprovider";
import { getDefaultProfile } from "../services/profileservice";
import LoadingComponent from "./loading";


export const DefaultProfileDirector = () => {
    const [profileidstate, setProfileidstate] = useState<string | undefined>(undefined);
    let navigate = useNavigate();
    useEffect(() => {

        if(profileidstate){
            navigate(`${profileidstate}`);

        } else {
            const setProfileToDefault = async () => {
                const profileidDefault = await getDefaultProfile();
                if(profileidDefault) setProfileidstate(profileidDefault);
            }
            if(profileidstate === undefined){
                setProfileToDefault();
            }
        }
        
    }, [profileidstate, navigate])

    return(
        <LoadingComponent/>
    )

}

export const DashboardLayout = ({ children, header, defaultbutton }:{children:React.ReactNode, header: string, defaultbutton:JSX.Element}) => {
    
    return (
        <div className="container">            
            <div className="row">
                <div className="col s2 l1"><br />
                    {defaultbutton}
                </div>
                <div className="col s10 l11"><br />
                    <h5 style={{ margin: 5 }} >{header}</h5>
                </div>
            </div>            
            
            <div className="row">
                <div className="col s12 l8">
                        {children}
                </div>
            </div>
        </div>
    )
};

export const AddNoteButton = () => {
    let navigate = useNavigate();
    return (
        <button onClick={()=> navigate(`notes/add`)} className="btn-floating waves-effect waves-light red">
                        <i className="material-icons">add</i>
        </button>
    )
}

export const ListNotesButton = ({ profileid }:{profileid:string}) => {
    let navigate = useNavigate();
    return (
        <button  onClick={() => navigate(`/dashboard/${profileid}`)} className="btn-floating waves-effect waves-light red">
            <i className="material-icons">list</i>
        </button>
    )
}

export const AutoCompleteSearch = () => {

    let navigate = useNavigate();
    const notesindex = useNotesIndex();

    const [searchNote, setSearchNote] = useState("")
    const [searchResult, setsearchResult] = useState<NoteDoc[]>([])

    return (
        <>
            <div className="container">            
                <div className="row" style={{marginTop:"20px"}}>
                    <div className="col s12 l8" > 
                        <div className="input-icons">
                            <i className="material-icons prefix">search</i>
                            <Autocomplete 
                                wrapperProps={{style:{width:"90%", display:"inline"}}} 
                                inputProps={{style:{width:"90%", height:"1.5rem"}, placeholder:"search", className:"inputfield"}} 
                                menuStyle={
                                    {
                                        zIndex:1000,
                                        position: "fixed",
                                        overflow:"auto",
                                        maxHeight:"50%",
                                        padding:"2px 0px",
                                        background:"rgba(255, 250, 250, 0.95)",
                                        boxShadow:"rgb(0 0 0 / 10%) 0px 2px 12px",
                                        borderRadius:"3px",
                                        
                                    }
                                }
                                value={searchNote} 
                                onChange={(event, value) => {
                                    setSearchNote(value)
                                    setsearchResult(notesindex.search(value));
                                }}  
                                items={searchResult} 
                                getItemValue={(item) => item.title} 
                                renderItem={(item, isHighlighted) => (
                                    <div
                                    className={`item ${isHighlighted ? 'item-highlighted' : ''}`}
                                    key={item.indexid}
                                    >{item.title}</div>
                                )}

                                onSelect={(value, item) => {                            
                                    navigate(`/dashboard/${item.profileid}/notes/${item.noteid}`)
                                }}
                            />
                
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
}