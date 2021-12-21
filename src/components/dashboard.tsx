import React from "react";
import { Routes, Route, useParams, useNavigate} from "react-router-dom";
import { ProfileNotes, useNotesFromProfile } from "../hooks/useNotesFromProfile";
import { FormController, FormControllerAdd } from "./formcontroller";
import LoadingComponent from "./loading";
import { AddNoteButton, AutoCompleteSearch, DashboardLayout, DefaultProfileDirector, ListNotesButton } from "./dashboardhelpers";

export const Dashboard = () => {
    return(
        <>
        <Routes>
            <Route path="/" element={<DefaultProfileDirector/>}/>
            <Route path="/:profileid/*" element={<ProfileNotesDashboard/>}/>
        </Routes>        
        </>
    )
}



export const ProfileNotesDashboard = () => {
    const {profileid} = useParams();

    const {profileState} = useNotesFromProfile(profileid as string);

    return (       
        <>
            {(profileState.key === "empty" || !profileState.initialload) && ( <LoadingComponent/> )}
            {profileState.key === "profile" && profileState.initialload && (
                <>
                <AutoCompleteSearch/>
                
                <Routes>
                    <Route path="/" element={<DashboardLayout defaultbutton={<AddNoteButton/>} header={"Notes:"}>
                                                <NotesList profilenotes={profileState}/>
                                            </DashboardLayout>}/>
                    <Route path="notes/add" element={<NoteAdd profileid={profileState.profileid}/>} />
                    <Route path="notes/:noteid" element={<NoteDetails profilenotes={profileState}/>}/>
                
                </Routes>
                </>
            )}
        </>
    )

}

export const NoteAdd = ({profileid}:{profileid:string}) => {
    return(
        <>
            <DashboardLayout defaultbutton={<ListNotesButton profileid={profileid}/>} header={"Profile:"}>
                <FormControllerAdd profileid={profileid} />
            </DashboardLayout>
        </>
    )

}
export const NoteDetails = ({profilenotes}:{profilenotes: ProfileNotes}) => {
    const {noteid} = useParams();
    return(
        <>
        {noteid === undefined && (<div>Not found!</div>)}
        {!profilenotes.initialload && (<LoadingComponent/>)}
        {noteid && profilenotes.initialload && 
            (()=>{                
                let note = profilenotes.notes.get(noteid);                
                return (
                    <>
                    {note ?
                        <DashboardLayout defaultbutton={<ListNotesButton profileid={note.data.profileid}/>} header={"Profile:"}>
                            <FormController note={note} />
                        </DashboardLayout> 
                        :                        
                        <div>Not found!</div>
                    }
                    </>
                )
                               
            })()
        }        
        </>
    )
}


export const NotesList = ({profilenotes}:{profilenotes: ProfileNotes}) => {
    let navigate = useNavigate();
    
    return(
    <div>
        { profilenotes.notes.count() > 0 && (
            <ul className="collection">
            {profilenotes.notes.valueSeq().toArray().map( n => (
            <li className="collection-item click-list-item" key={n.id} onClick={() => navigate(`notes/${n.id}`)} >{n.data.title} </li>
            ))}
            </ul>    
        )}
    </div>
    )
}


