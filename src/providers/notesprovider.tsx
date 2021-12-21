
import React from "react";
import { ProfileState, useNotesFromProfile } from "../hooks/useNotesFromProfile";


export type NotesContextType = {
    profileState: ProfileState,    
}

export const NotesContext = React.createContext<NotesContextType>(null!);

export const NotesProvider = ({children}:{children:React.ReactNode}) => {

    const {profileState} = useNotesFromProfile("");

    let value: NotesContextType = {profileState}

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>

}

export const useNotes = () => {
    return React.useContext(NotesContext)
}