import React, { useState, useRef, useEffect } from "react";
import "./ContactForm.css"; // Import your CSS file here

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [contactBlurb, setContactBlurb] = useState("");
  const [isNameTyping, setIsNameTyping] = useState(false);
  const [isEmailTyping, setIsEmailTyping] = useState(false);
  const [isMessageTyping, setIsMessageTyping] = useState(false);
  const [isSubjectTyping, setIsSubjectTyping] = useState(false);
  const typ_name = useRef();
  const typ_email = useRef();
  const typ_mess = useRef();
  const typ_sub = useRef();
  const contact_button = useRef(null);
  const notif_button = useRef(null);

  useEffect(() => {
    // Check if any of the fields have values when the form is opened
    if (showContactPopup) {
      if (name) {
        typ_name.current.classList.add("typing");
      }
      if (email) {
        typ_email.current.classList.add("typing");
      }
      if (message) {
        typ_mess.current.classList.add("typing");
      }
      if (subject) {
        typ_sub.current.classList.add("typing");
      }
    }
  }, [showContactPopup]);

  const validateEmail = (email) => {
    var re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  const closeForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSubject("");

    setShowContactPopup(false);
    setShowNotificationPopup(true);
    setNotificationText("Thanks for contacting us!");
  };

  const handleContactClick = () => {
    if (contact_button.current) {
      contact_button.current.classList.add("is-visible");
    }
    setShowContactPopup(true);
    setContactBlurb(
      "Questions, suggestions, and general comments are all welcome!"
    );
  };

  const handleClosePopups = (event) => {
    if (
      event.target.classList.contains("cd-popup-close") ||
      event.target.classList.contains("cd-popup")
    ) {
      event.preventDefault();

      const inputFields = document.querySelectorAll(
        ".name input, .email input, .message textarea , .subject input"
      );

      let shouldRemoveTyping = true;

      inputFields.forEach((input) => {
        if (input.value.trim() !== "") {
          shouldRemoveTyping = false;
        }
      });

      if (shouldRemoveTyping) {
        typ_name.current.classList.remove("typing");
        typ_email.current.classList.remove("typing");
        typ_mess.current.classList.remove("typing");
        typ_sub.current.classList.remove("typing");
      }

      contact_button.current.classList.add("fade-out");

      setTimeout(() => {
        setShowContactPopup(false);
      }, 300);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateEmail(email)) {
      if (name) {
        if (subject) {
          if (message) {
            // Handle submitting data somewhere
            const messageData = {
              name,
              email,
              subject,
              message,
            };

            try {
              const response = await fetch(
                "http://localhost:8000/api/submit-message",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(messageData),
                }
              );

              if (response.ok) {
                setNotificationText("Thanks for contacting us!");
                setShowNotificationPopup(true);
                closeForm();
              } else {
                // Handle server error or validation errors
                const data = await response.json();
                setNotificationText(
                  data.error || "An error occurred while submitting the form."
                );
                setShowNotificationPopup(true);
              }
            } catch (error) {
              console.error("Error submitting message:", error);
              setNotificationText(
                "An error occurred while submitting the form."
              );
              setShowNotificationPopup(true);
            }
          } else {
            setNotificationText("Please let us know what you're thinking!");
            setShowNotificationPopup(true);
          }
        } else {
          setNotificationText("Please provide a subject.");
          setShowNotificationPopup(true);
        }
      } else {
        setNotificationText("Please provide a name.");
        setShowNotificationPopup(true);
      }
    } else {
      setNotificationText("Please use a valid email address.");
      setShowNotificationPopup(true);
    }
  };

  const handleclick = (ref) => {
    ref.current.classList.add("typing");
  };

  const handledisclick = (ref) => {
    const inputOrTextarea = ref.current.querySelector("input, textarea");
    if (inputOrTextarea) {
      if (!inputOrTextarea.value) {
        ref.current.classList.remove("typing");
      }
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
  };

  return (
    <div>
      <div className="contact-container">
        <h2></h2>
        <ul className="actions">
          <li>
            <a
              onClick={() => {
                setShowContactPopup(true);
                handleContactClick();
              }}
              className="button big"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      {showContactPopup && (
        <div
          className={`cd-popup contact is-visible ${
            showContactPopup ? "fade-in" : "fade-out"
          }`}
          role="alert"
          ref={contact_button}
        >
          <form
            id="contactform"
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <div className="cd-popup-container">
              <p>
                <a
                  href="#"
                  className="cd-popup-close cd-close-button"
                  onClick={handleClosePopups}
                >
                  <i
                    className="fa fa-times"
                    style={{ pointerEvents: "none" }}
                  ></i>
                </a>
              </p>
              <div className="name" ref={typ_name}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  onFocus={() => handleclick(typ_name)}
                  onBlur={() => handledisclick(typ_name)}
                  className={isNameTyping || name ? "typing" : ""}
                  required
                />
              </div>

              <div className="email" ref={typ_email}>
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => handleclick(typ_email)}
                  onBlur={() => handledisclick(typ_email)}
                  className={isEmailTyping || email ? "typing" : ""}
                  required
                />
              </div>

              <div className="subject" ref={typ_sub}>
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={subject}
                  onChange={handleSubjectChange}
                  onFocus={() => handleclick(typ_sub)}
                  onBlur={() => handledisclick(typ_sub)}
                  className={isSubjectTyping || subject ? "typing" : ""}
                  required
                />
              </div>

              <div className="message" ref={typ_mess}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={handleMessageChange}
                  onFocus={() => handleclick(typ_mess)}
                  onBlur={() => handledisclick(typ_mess)}
                  className={isMessageTyping || message ? "typing" : ""}
                  required
                ></textarea>
              </div>
              <br />
              <br />
              <div className="submit">
                <p className="user-message" id="contactblurb">
                  Questions, suggestions, and general comments are all welcome!
                </p>
                <input type="submit" name="submit" id="submit" value="Send" />
              </div>
            </div>
          </form>
        </div>
      )}

      {showNotificationPopup && (
        <div
          className={`cd-popup notification is-visible ${
            showNotificationPopup ? "fade-in" : "fade-out"
          }`}
          role="alert"
          ref={notif_button}
        >
          <div className="cd-popup-container">
            <a
              className="cd-popup-close cd-close-button"
              onClick={() => {
                notif_button.current.classList.add("fade-out");

                setTimeout(() => {
                  setShowNotificationPopup(false);
                }, 300);
              }}
            >
              <i className="fa fa-times" style={{ cursor: "pointer" }}></i>
            </a>
            <p>
              <div id="notification-text">{notificationText}</div>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
