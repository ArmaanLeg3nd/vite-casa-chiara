import React, { useRef, useState, useEffect } from "react";
import './Login.css';

function Login() {
  const [userName, setUserName] = useState()
  const [password, setPassword] = useState()
  const typ_username = useRef(null);
  const typ_pass = useRef(null);
  const lab_username = useRef(null);
  const lab_pass = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    handletyp();
  }, []);

  const handletyp = () => {
    if(typ_username.current.value){
      typ_username.current.classList.add('typing');
    }

    if(typ_pass.current.value){
      typ_pass.current.classList.add('typing');
    }
  };

  const handleclick = (ref) => {
    ref.current.classList.add('typing');
  };
  
  const handledisclick = (ref) => {
    const input = ref.current.querySelector('input');
    if (input) {
      if (!input.value) {
        ref.current.classList.remove('typing');
      }
    }
  };

  const handlered = () => {
    document.documentElement.style.setProperty('--dynamic-color', 'red');
    typ_username.current.querySelector('input').focus();
  };

  const handlered_pass = () => {
    document.documentElement.style.setProperty('--dynamic-color', 'red');
    typ_pass.current.querySelector('input').focus();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if(userName)
    {
      if(password)
      {
        try {
          const response = await fetch('http://localhost:8000/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: userName, password }), // Use the hashed password
              credentials: 'include',
          });
  
          if (response.ok) {
            window.location.href = '/auth';
          } else {
            setErrorMessage('Invalid username or password. Please check your credentials.');
            handlered();
          }
        } catch (error) {
          setErrorMessage('An error occurred during login. Please try again.');
          handlered();
        }
      }
      else{
        setErrorMessage('Please fill the password.');
        handlered_pass();
      }
    }
    else{
      setErrorMessage('Please fill the username.');
      handlered();
    }
};


  return (
    <div className="login-container">
      <button className="custom-buttonn" title="Go Back" onClick={() => {window.location.href = '/';}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" className="stroke-blue-300">
          <path d="M11 6L5 12M5 12L11 18M5 12H19"></path>
        </svg>
      </button>
      <form className="login-form" autoComplete="off" role="presentation" >
        <div className="login-text">
          <span className="lock-ico fa-stack fa-lg">
            <i className="fa fa-circle fa-stack-2x"></i>
            <i className="fa fa-lock fa-stack-1x"></i>
          </span>
          <br />
          <div id="login-title">Admin Login</div>
        </div>
        <br />
        <div className="username" ref={typ_username}>
          <input role="presentation" autoComplete="off" readOnly type="username" className="login-username" name="username" id="username" required={true} onFocus={() => {handleclick(typ_username); typ_username.current.querySelector('input').removeAttribute('readonly'); typ_pass.current.querySelector('input').readOnly=true; }} onBlur={() => {handledisclick(typ_username);  typ_username.current.querySelector('input').readOnly=true;}} onChange={(e)=>{setUserName(e.target.value); document.documentElement.style.setProperty('--dynamic-color', '#3498db'); setErrorMessage('');}} />
          <label htmlFor="username" ref={lab_username}>Username</label>
        </div>
        <p></p>
        <div className="pass" ref={typ_pass}>
          <input role="presentation" autoComplete="off" readOnly type="password" className="login-password" name="password" id="password" required={true} onFocus={() => {handleclick(typ_pass); typ_pass.current.querySelector('input').removeAttribute('readonly'); typ_username.current.querySelector('input').readOnly=true;}} onBlur={() => {handledisclick(typ_pass); typ_pass.current.querySelector('input').readOnly=true;}} onChange={(e)=>{setPassword(e.target.value); document.documentElement.style.setProperty('--dynamic-color', '#3498db'); setErrorMessage('');}}/>
          <label htmlFor="password" ref={lab_pass}>Password</label>
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <br />
        <button className="login-submit" type="submit" onClick={handleSubmit}>Login</button>
      </form>
      <div className="underlay-photo"></div>
      <div className="underlay-black"></div>
    </div>
  );
}

export default Login;