import React, { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './load.css'

function Auth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch('http://localhost:8000/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthenticated(data.authenticated);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('An error occurred during authentication:', error);
        setAuthenticated(false);
      }

      setLoading(false); // Mark loading as done
    }

    checkAuthentication();
  }, []);

  // Render different components based on authentication status
  if (loading) {
    return( 
      <div>
        <div className="typing-indicator">
        <div className="typing-circle"></div>
        <div className="typing-circle"></div>
        <div className="typing-circle"></div>
        <div className="typing-shadow"></div>
        <div className="typing-shadow"></div>
        <div className="typing-shadow"></div>
      </div>
    </div>
    ); // You can customize this loading indicator
  } else if (!authenticated) {
    return <Navigate to="/login" />;
  } else if(authenticated) {
    return <Navigate to="/dashboard" />;
  }
}

export default Auth;
