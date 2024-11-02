import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import "./Admin.css";
import "./load.css";
import BookDates from "./BookDates";
import CheckMessages from "./CheckMessages";
import Dashboard from "./Dashboard";
import Previewdates from "./Previewdates";

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [activeLink, setActiveLink] = useState(null);
  const [contentOpacity, setContentOpacity] = useState(1);
  const dash = useRef(null);
  const dashm = useRef(null);
  const bd = useRef(null);
  const bdm = useRef(null);
  const m = useRef(null);
  const mm = useRef(null);
  const bdd = useRef(null);
  const bdp = useRef(null);

  async function signOut() {
    try {
      const response = await fetch("http://localhost:8000/auth/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include credentials in the request
      });
  
      if (response.ok) {
        setAuthenticated(false);
      } else {
        alert("Error logging out");
      }
    } catch (error) {
      console.error("An error occurred while logging out:", error);
    }
  }
  

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch("http://localhost:8000/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setAuthenticated(data.authenticated);
          setActiveLink("Dashboard");
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("An error occurred during authentication:", error);
        setAuthenticated(false);
      }

      setLoading(false); // Mark loading as done
    }

    checkAuthentication();
  }, []);

  const handleLinkClick = (link) => {

    const adnavCheck = document.querySelector("#adnav-check");
    if (adnavCheck) {
      adnavCheck.checked = false;
      handleAdnavCheckChange();
    }

    if(link === "BookDatesd"){
      bd.current.classList.add("active");
      dash.current.classList.remove("active");
      m.current.classList.remove("active");
      try {
        bdd.current.classList.add("active");
        bdp.current.classList.remove("active");
      } catch (error) {
        
      }
    }
    else if(link === "CheckMessages"){
      bd.current.classList.remove("active");
      dash.current.classList.remove("active");
      m.current.classList.add("active");
    }
    else if(link === "Dashboard"){
      bd.current.classList.remove("active");
      dash.current.classList.add("active");
      m.current.classList.remove("active");
    }
    else if(link === "BookDatesp"){
      bd.current.classList.add("active");
      dash.current.classList.remove("active");
      m.current.classList.remove("active");
      try {
        bdd.current.classList.remove("active");
        bdp.current.classList.add("active");
      }
      catch (error) {
        
      }
    }
    setActiveLink(link);
  };

  // Render different components based on active link
  const renderheaderContent = () => {
    if (activeLink === "BookDatesd") {
      return(
        <div>
          <h1 className="title">Modify Villa Vacancy</h1>
          <nav className="nav-tabs" id="nav-tabs">
            <a className="active" ref={bdd} style={{"cursor": "pointer"}} onClick={() => handleLinkClick("BookDatesd")}>
              Modify Booking Dates
            </a>
            <a ref={bdp} style={{"cursor": "pointer"}} onClick={() => handleLinkClick("BookDatesp")}>
              Preview
            </a>
          </nav>
        </div>
      );
    }
    else if (activeLink === "BookDatesp") {
      return(
        <div>
          <h1 className="title">Modify Villa Vacancy</h1>
          <nav className="nav-tabs" id="nav-tabs">
            <a ref={bdd} style={{"cursor": "pointer"}} onClick={() => handleLinkClick("BookDatesd")}>
              Modify Booking Dates
            </a>
            <a className="active" ref={bdp} style={{"cursor": "pointer"}} onClick={() => handleLinkClick("BookDatesp")}>
              Preview
            </a>
          </nav>
        </div>
      );
    }
    else if (activeLink === "CheckMessages") {
      return (
        <div>
          <h1>Check Messages</h1>
          <br />
          <nav className="nav-tabs" id="nav-tabs"></nav>
        </div>
      );
    } else if (activeLink === "Dashboard") {
      return (
        <div>
          <h1>Dashboard</h1>
          <br />
          <nav className="nav-tabs" id="nav-tabs"></nav>
        </div>
      );
    } 
    else {
      // Default content when no link is active
      return (
        <div>
          <h1>Dashboard</h1>
          <br />
          <nav className="nav-tabs" id="nav-tabs"></nav>
        </div>
        );
    }
  };

  const renderMainContent = () => {
    if (activeLink === "BookDatesd") {
      return(
        <BookDates />
      );
    } else if (activeLink === "BookDatesp") {
      return(
        <Previewdates/>
      );
    }
     else if (activeLink === "CheckMessages") {
      return( 
        <CheckMessages />
      );
    } else if (activeLink === "Dashboard") {
      return(
        <Dashboard />
      );
    } else {
      // Default content when no link is active
      return(
        <Dashboard />
      );
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 850);
  };

  useEffect(() => {
    // Add a window resize event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAdnavCheckChange = () => {
    const body = document.querySelector("body");
    const adnavCheck = document.querySelector("#adnav-check");
    
    if (adnavCheck.checked) {
      body.classList.add("no-scroll");
    } else {
      body.classList.remove("no-scroll");
    }
  };

  // Render different components based on authentication status
  if (loading) {
    return (
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
    window.location.href = '/login';
  } else if (authenticated) {
    return (
      <div className="adminbody">
        <div className="site-wrap">

          <nav className="site-nav">

            <div className="adname">
              Admin Panel
            </div>

            <ul>
              <li className="active" ref={dash}><a style={{"cursor": "pointer"}} onClick={() => handleLinkClick("Dashboard")}>Dashboard</a></li>
              <li ref={bd}><a style={{"cursor": "pointer"}} onClick={() => handleLinkClick("BookDatesd")}>Modify Booking Dates</a></li>
              <li ref={m}><a style={{"cursor": "pointer"}} onClick={() => handleLinkClick("CheckMessages")}>Messages</a></li>
            </ul>

          </nav>

          <main className="mainbody_admin" style={{ opacity: contentOpacity }}>

          {isMobile && (
              //here
              <div className="adnav">
                <input type="checkbox" id="adnav-check" onChange={handleAdnavCheckChange}/>
                <div className="adnav-btn">
                  <label htmlFor="adnav-check">
                    <span></span>
                    <span></span>
                    <span></span>
                  </label>
                </div>
                
                <div className="adnav-links">
                  <li ref={dashm}><a style={{"cursor": "pointer"}} onClick={() => handleLinkClick("Dashboard")}>Dashboard</a></li>
                  <li ref={bdm}><a style={{"cursor": "pointer"}} onClick={() => handleLinkClick("BookDatesd")}>Modify Booking Dates</a></li>
                  <li ref={mm}><a style={{"cursor": "pointer"}} onClick={() => handleLinkClick("CheckMessages")}>Messages</a></li>
                </div>
              </div>
            )}
            <br />
            <header className="mainheader_admin" style={{ opacity: contentOpacity }}>

              <button className="signoutb" onClick={() => signOut()}>Signout</button>
                {renderheaderContent()}
            </header>
            <br/>
              {renderMainContent()}
          </main>

          </div>
      </div>
    );
  }
}

export default Admin;
