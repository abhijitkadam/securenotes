import { useForm } from 'react-hook-form';
import { Result } from 'ts-results';

export const SecurePasswordForm = ({onSubmit}:{onSubmit:(password:string)=>Promise<Result<boolean, Error>>}) => {

    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm();

    const onSubmitClicked = async (data:any) => {        
        const isPasswordCorrectRes = await onSubmit(data.password);

        if(isPasswordCorrectRes.ok ){
            if(isPasswordCorrectRes.val){
                clearErrors("password");
            }else {
                setError("password",{type:"passwordincorrect",
                message:""} );
            }
            
        } else {
            setError("password",{type:"passwordapierror",
            message:""} );
        }
    }

    return ( 
       
        <form onSubmit={handleSubmit(onSubmitClicked)}>
            <label><h6>Enter profile password for securing data</h6>
                {errors?.password?.type === "required" && <div>Password is required</div>}
                {errors?.password?.type === "passwordincorrect" && <div>
                    <span className="red-text text-lighten-3">Please enter correct password! </span>
                    <div>
                        We don't store password, however fingerprint hash detected incorrect password.
                    </div>
                </div>}
                {errors?.password?.type === "passwordapierror" && <div>
                    <span className="red-text text-lighten-3">Error in operation, try again! </span>
                    
                </div>} 
                <input type="password" placeholder="Password" {...register("password", { required: true, maxLength: 500 })} />
            </label>
            <div className="blue-text text-lighten-3">This password will not be sent to the server and also not stored in browser persistance storage. Only hash fingerprint is sent to server.</div>
            <div className="red-text text-lighten-3">This password should not change as this will be key to unlocking the data</div> 
            <br />
            <button className="btn waves-effect waves-light" type="submit">Ok</button>
        </form>
        
    )
}
