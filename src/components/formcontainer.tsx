import React from "react"


export type FormState = "view" | "edit" | "add";

export const FormContainer = ({children, title, formstate, toggleEditMode}:
                                {children:React.ReactNode, title: string, formstate:FormState, toggleEditMode:()=>void}) => {

    return (
        <>           
            <div className="row">
                <div className="col s2 l1">
                    <div  onClick={()=> toggleEditMode()} className="waves-effect waves-light">
                        <i className="material-icons">{formstate === "view" && ("edit")}{formstate === "edit" && ("cancel")}</i>
                    </div>                            
                </div>
                <div className="col s6 l7"><h5 style={{margin:"0"}}>{title}</h5></div>
            </div>
            <div className="row">
                <div className="col s12 l8">
                    {children} 
                </div>
            </div>
           
        </>
    )

}