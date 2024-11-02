import React, { useEffect, useRef, useState } from "react";
import "./LandingPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel } from "react-bootstrap";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { DateRange } from "react-date-range";
import axios from "axios";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Footer from "./Footer";
import ContactForm from "./ContactForm";

function transformBookedDates(bookedDates) {
  const disabledDates = [];

  function countLeapYears(year) {
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      return 1;
    } else {
      return 0;
    }
  }

  function getDifference(dt1, dt2) {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let n1 = dt1.y * 365 + dt1.d;
    for (let i = 0; i < dt1.m - 1; i++) {
      n1 += monthDays[i];
    }
    n1 += countLeapYears(dt1.y);

    let n2 = dt2.y * 365 + dt2.d;
    for (let i = 0; i < dt2.m - 1; i++) {
      n2 += monthDays[i];
    }
    n2 += countLeapYears(dt2.y);

    return n2 - n1;
  }

  bookedDates.forEach((dateRange) => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    const daysDifference = getDifference(
      {
        d: startDate.getDate(),
        m: startDate.getMonth() + 1,
        y: startDate.getFullYear(),
      },
      {
        d: endDate.getDate(),
        m: endDate.getMonth() + 1,
        y: endDate.getFullYear(),
      }
    );

    const currentDate = new Date(startDate);
    for (let i = 0; i <= daysDifference; i++) {
      disabledDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return disabledDates;
}

function LandingPage() {
  const pictureRef = useRef(null);
  const secondPictureRef = useRef(null);
  const contentRef = useRef(null);
  const thirdContentRef = useRef(null);
  const fourthContentRef = useRef(null);
  const secondContentRef = useRef(null); // Add a reference for con-cont section
  const [className, setClassName] = useState("");
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false); // Track whether the images have finished loading
  const [loadedImages, setLoadedImages] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectionRanges, setSelectionRanges] = useState([]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setShowLightbox(true);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex + loadedImages.length - 1) % loadedImages.length
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % loadedImages.length);
  };

  const handleCloseLightbox = () => {
    setShowLightbox(false);
  };

  const images = [
    "https://via.placeholder.com/500x300",
    "https://via.placeholder.com/500x500",
    "https://via.placeholder.com/500x300",
    "https://via.placeholder.com/500x500",
    "https://via.placeholder.com/500x300",
    "https://via.placeholder.com/500x500",
    "https://via.placeholder.com/500x300",
    "https://via.placeholder.com/500x500",
    "https://via.placeholder.com/500x300",
    "https://via.placeholder.com/500x500",
    // Add more image URLs here
  ];

  useEffect(() => {
    function handleScroll() {
      
      const yScrollPosition = window.scrollY;
      const scrollMultiplier = 0.5;

      const pictureOffset = yScrollPosition * scrollMultiplier * -0.9;
      const secondPictureOffset = yScrollPosition * scrollMultiplier * -0.2;
      const contentOffset = yScrollPosition * scrollMultiplier * -0.8;
      const thirdContentOffset = yScrollPosition * scrollMultiplier * -0.8;
      const fourthPictureOffset = yScrollPosition * scrollMultiplier * -0.8;
      const secondContentOffset = yScrollPosition * scrollMultiplier * -0.8;

      pictureRef.current.style.transform = `translateY(${pictureOffset}px)`;
      secondPictureRef.current.style.transform = `translateY(${secondPictureOffset}px)`;
      contentRef.current.style.transform = `translateY(${contentOffset}px)`;
      thirdContentRef.current.style.transform = `translateY(${thirdContentOffset}px)`;
      secondContentRef.current.style.transform = `translateY(${secondContentOffset}px)`;
      fourthContentRef.current.style.transform = `translateY(${fourthPictureOffset}px)`;

      if (yScrollPosition === 0) {
        document.querySelector('.nav').classList.add('nav-translucent');
        document.querySelector('.nav').classList.remove('nav-opaque');
      } else {
        document.querySelector('.nav').classList.remove('nav-translucent');
        document.querySelector('.nav').classList.add('nav-opaque');
      }
    }

    function handleResize() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 1200) {
        setClassName("col-md-60");
      } else {
        setClassName("col-md-6");
      }
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (showLightbox) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [showLightbox]);

  useEffect(() => {
    // Preload the images
    const preloadImages = async () => {
      const promises = images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
        });
      });

      try {
        const loadedImages = await Promise.all(promises);
        setLoadedImages(loadedImages);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    // Fetch booked dates from the backend
    const fetchBookedDates = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/bookings");
        const { bookedDates } = response.data;

        const newSelectionRanges = bookedDates.map((dateRange, index) => ({
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
          key: `selection${index + 1}`,
          color: "#b4b4b4",
        }));

        setSelectionRanges(newSelectionRanges);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchBookedDates();
  }, []);

  useEffect(() => {
    // Fetch statistics data from the server
    axios.get('http://localhost:8000/api/ustats/home')
      .then((response) => {

      })
      .catch((error) => {
        
      });
  }, []);

  return (
    <div className="lpmain">
      <div className="nav nav-translucent">
        <input type="checkbox" id="nav-check"></input>
        <div className="nav-header">
          <div className="nav-title">
            Villa Casa Chiara Logo
          </div>
        </div>
        <div className="nav-btn">
          <label htmlFor="nav-check">
            <span></span>
            <span></span>
            <span></span>
          </label>
        </div>
        
        <div className="nav-links">
          <a onClick={() => {window.location.href = '/';}} style={{cursor : "pointer"}}>Home</a>
          <a onClick={() => {window.location.href = '/vacation-rental';}} style={{cursor : "pointer"}}>Vacation Rental</a>
          <a onClick={() => {window.location.href = '/services';}} style={{cursor : "pointer"}}>Services</a>
          
        </div>
      </div>
      <section className="hero-treatment">
        <div className="bg-text">
        Villa Casa Chiara, holiday villa rentals in Zambrone, Tropea, Calabria, Italy ...
        </div>
        <div className="frontmain" ref={pictureRef}></div>
      </section>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <section id="s1" ref={contentRef}>
        <div className="container">
          <div className="row">
            <div className={`row ${className}`}>
              <p id="p1">
                Welcome to this beautiful Villa Casa Chiara, which is nestled
                within beautiful green hills, far away from the main Tropea
                road, which is your space designed It’s idyllic, quiet and
                peaceful location and stunning views of the sea, allow time for
                reflection and relaxation. Situated within a mile of the
                authentic Italian village of “Zambroni”, the villa is
                10-minutes’ drive from the romantic town of Tropea and
                20-minutes from historic Pizzo; the home of the famous,
                delicious Tartufo ice cream.
              </p>
            </div>
            <div className="col-md-6" id="carousel-container">
              <Carousel>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src="https://via.placeholder.com/500x300"
                    alt="Image 1"
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src="https://via.placeholder.com/500x300"
                    alt="Image 2"
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src="https://via.placeholder.com/500x300"
                    alt="Image 3"
                  />
                </Carousel.Item>
              </Carousel>
            </div>
          </div>
        </div>
        <div className="purple-break">
          <div className="purple-block">
            <p>Some text inside the purple block</p>
          </div>
        </div>
        <div className="col-md-12" id="image-container">
          <div className="row justify-content-center">
            <div className="col-md-3 tri-mar">
              <img
                className="d-block w-100 mx-auto"
                src="https://via.placeholder.com/500x300"
                alt="Image 1"
                style={{ maxWidth: "350px", height: "auto" }}
              />
              <p>Sample Text 1</p>
            </div>
            <div className="col-md-3 tri-mar">
              <img
                className="d-block w-100 mx-auto"
                src="https://via.placeholder.com/500x300"
                alt="Image 2"
                style={{ maxWidth: "350px", height: "auto" }}
              />
              <p>Sample Text 2</p>
            </div>
            <div className="col-md-3 tri-mar">
              <img
                className="d-block w-100 mx-auto"
                src="https://via.placeholder.com/500x300"
                alt="Image 3"
                style={{ maxWidth: "350px", height: "auto" }}
              />
              <p>Sample Text 3</p>
            </div>
          </div>
        </div>
      </section>
      <div className="second-parallax" ref={secondPictureRef}></div>{" "}
      {/* Add the new parallax image */}
      <section id="s2" ref={thirdContentRef} className="sec2">
        <div className="purple-break" id="pb2">
          <div className="purple-block">
            <p>Some text inside the purple block</p>
          </div>
        </div>
        <div className="gallery">
          <div className="row">
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 1"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(0)}
              />
              <div className="ssp"></div>
            </div>
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 2"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(1)}
              />
              <div className="ssp"></div>
            </div>
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 3"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(2)}
              />
              <div className="ssp"></div>
            </div>
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 4"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(3)}
              />
              <div className="ssp"></div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 5"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(4)}
              />
              <div className="ssp"></div>
            </div>
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 6"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(5)}
              />
              <div className="ssp"></div>
            </div>
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 7"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(6)}
              />
              <div className="ssp"></div>
            </div>
            <div className="col-md-3">
              <img
                className="d-block w-100"
                src="https://via.placeholder.com/500x300"
                alt="Image 8"
                style={{ maxWidth: "300px", height: "auto" }} // Scale down the image size
                onClick={() => handleImageClick(7)}
              />
              <div className="ssp"></div>
            </div>
          </div>
          <button id="bottone5" onClick={() => handleImageClick(0)}>
            More photos
          </button>
          <br />
          <br />
          <br />
          <br />
          <center>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </center>
        </div>
      </section>
      <section ref={fourthContentRef} className="con-cont">
        <div className="card c1" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <h6 className="card-subtitle mb-2 text-body-secondary">
              Card subtitle
            </h6>
            <p className="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
          </div>
        </div>
      </section>
      <section id="s3" ref={secondContentRef} className="sec3">
        <div className="purple-break" id="pb3">
          <div className="purple-block">
            <p>Some text inside the purple block</p>
          </div>
        </div>
        <div className="main-container">
          <div className="booking-process-details">
            For booking inquiries, please contact us at{" "}
            <a href="mailto:villacasa@abc.com">
            villacasa@abc.com
            </a>{" "}
            . We will get back to you as soon as possible. You can also call us at{" "}
            <a href="tel:+1234567890">+1234567890</a>. You can also drop us a message via the contact us button below. 
            We look forward to hearing from you! Meanwhile, you can check the availability of the
            villa in the calendar. Please note that the dates marked in grey
            indicate that the villa is already booked.
          </div>
          <div className="fixed-width-card-container">
            <div className="card c2 fixed-width-card" style={{ width: "20rem" }}>
              <div className="card-body custom-card-body"> {/* Add custom-card-body class */}
                <h5 className="card-title">Villa Availability</h5>
                <h6 className="card-subtitle mb-2 text-body-secondary">Check Available Dates</h6>
                <div className="calendar-container">
                  <DateRange
                    onChange={(item) => {
                      setSelectionRanges(item);
                      console.log("Selection clicked:", item);
                    }}
                    ranges={selectionRanges}
                    showSelectionPreview={false}
                    showPreview={false}
                    showDateDisplay={false}
                    months={1}
                    editableDateInputs={false}
                    direction="horizontal"
                    minDate={new Date()}
                    className="custom-calendar"
                    staticRanges={[]}
                    inputRanges={[]}
                    style={{
                      width: "100%", // Occupies full width of the container
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showLightbox && imagesLoaded && (
        <Lightbox
          open={showLightbox}
          close={handleCloseLightbox}
          slides={loadedImages.map((src) => ({
            src,
            alt: "Image",
            width: 500,
            height: 300,
          }))}
          startIndex={selectedImageIndex}
        ></Lightbox>
      )}
      <ContactForm />
      <div className="horizontal-block"></div>
      <Footer />
    </div>
  );
}

export default LandingPage;
