import React, { useEffect } from 'react';
import './App.css';
import "./firebase/firebase";

import { getAuth } from '@firebase/auth';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import { Home } from './home';
import { AuthStateProvider, RequireAuth, useAuth } from './providers/authprovider';
import { SecureStateProvider } from './providers/securestate';
import M from 'materialize-css';
import { Dashboard } from './components/dashboard';
import { NotesProvider } from './providers/notesprovider';
import { NotesIndexProvider } from './providers/notesindexprovider';

function App() {
  return (    
    <AuthStateProvider auth={getAuth()}>
      <SecureStateProvider>
        <NotesProvider>
        <NotesIndexProvider>
        <Router>
          <Guard>
            <NavBar/>          
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/dashboard/*" element={<RequireAuth> <Dashboard/> </RequireAuth>}/>
            </Routes>
          </Guard>
        </Router>
        </NotesIndexProvider>
        </NotesProvider>
    </SecureStateProvider>
    </AuthStateProvider>
  );
}

const Guard = ({children}:{children:React.ReactNode}) => {
  const {authState} = useAuth();

  return(
      <>
        {authState.key === "loading" && (<></>)}
        {authState.key !== "loading" && authState.key !== "autherror" && children}        
      </>
    )
}


export default App;


export const NavBar = () => {

  const {authState, login, logout, isUserState} = useAuth();

  useEffect(() => {
    if(isUserState()) {
      var elem = document.querySelector('.sidenav');
      if(elem) M.Sidenav.init(elem);
    }
  },[authState, isUserState]);

  return(
    <>
    {authState.key === "loading" && (<></>)}
    {authState.key === "autherror" && (<>Error in login</>)}
    {authState.key === "loaded" &&
      (<nav>      
          <div className="nav-wrapper">
          {authState.state.key === "user" && (<a className="sidenav-trigger" data-target="slide-out">
			        <i className="material-icons">menu</i>
		          </a> )
          }
          <Link className="brand-logo left" to="/"><i className="material-icons" style={{marginRight:"2px"}}>security</i>Notes </Link>
            {authState.state.key === "user" ? (
              <div>
                <ul className="left hide-on-med-and-down">                    
                  <li><Link to="/dashboard">Dashboard</Link></li>                    
                </ul>            
                <ul className="right hide-on-med-and-down">
                  <li>{authState.state.user.displayName}</li>
                  <li><span className="click-link" onClick={logout}>Log out</span> </li>  
                </ul>
              </div>
            ):(            
              <ul className="right"> 
                <li><span className="click-link" onClick={login}>Log in</span></li>
              </ul>
            )}

          </div>
        
      </nav>)
    }
    {authState.key === "loaded" && authState.state.key === "user" && (
        <>
        <ul id="slide-out" className="sidenav">
          <li><div className="user-view">
            <div className="background teal lighten-3">
              {/* <img src="images/office.jpg"/> */}
            </div>
            <div><img className="circle" alt={""} src={authState.state.user.photoURL as string}/></div>
            <div><span className="white-text name">{authState.state.user.displayName}</span></div>
            <div><span className="white-text email">{authState.state.user.email}</span></div>
          </div></li>
          <li className="sidenav-close"><Link to="/dashboard">Dashboard</Link></li>
          <li className="sidenav-close"><a onClick={logout}>Log out </a></li>
        </ul>
        {/* <a href="#" data-target="slide-out" class="sidenav-trigger"><i class="material-icons">menu</i></a> */}
        </>
      )}    
    </>
  )

}
