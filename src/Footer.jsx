import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
        
      <div className="footer-content">
        <div className="social-links">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
        <div className="contact-info">
          <p>Contact us: <a href="mailto:villacasa@abc.com">villacasa@abc.com</a></p>
          <p>Call us: <a href="tel:+1234567890">+1234567890</a></p>
        </div>
      </div>
      <div style={{ marginLeft: `calc(50% - 43.22px)` }}> 
          <a href="/login" style={{textDecoration: "none", color: "white"}}>Admin login</a>
      </div>
    </footer>
  );
}

export default Footer;
