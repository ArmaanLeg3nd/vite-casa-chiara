import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './BookDates.css';
import axios from 'axios';

const BookDates = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null); // New state for the selected date range

  useEffect(() => {
    // Fetch booked dates from the server
    axios.get('http://localhost:8000/api/bookings')
      .then((response) => {
        setBookedDates(response.data.bookedDates);
      })
      .catch((error) => {
        console.error('Error fetching booked dates:', error);
      });
  }, []);

  // Function to format a date as "YYYY-MM-DD"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to format a date as "5th September 2023"
  const formatReadableDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Function to handle date range selection
  const handleSelect = (ranges) => {
    const startDate = ranges.selection.startDate;
    const endDate = ranges.selection.endDate;

    // Format dates as "YYYY-MM-DD"
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Combine start and end dates with a hyphen
    const formattedRange = `${formattedStartDate} - ${formattedEndDate}`;

    // Update state with the selected date range
    setDateRange([ranges.selection]);
    setSelectedDateRange(formattedRange); // Set the selected date range in state
  };

  const handleDelete = (index) => {
    // Make a copy of the bookedDates array
    const updatedBookedDates = [...bookedDates];
    
    // Remove the selected date range from the copy
    updatedBookedDates.splice(index, 1);
  
    // Update the state with the updated array
    setBookedDates(updatedBookedDates);
  
    // Perform the delete operation on the server (optional)
    const deletedDateRange = bookedDates[index];
    axios.delete(`http://localhost:8000/api/bookings/${deletedDateRange.id}`)
      .then(() => {
        console.log('Successfully deleted date range:', deletedDateRange);
      })
      .catch((error) => {
        console.error('Error deleting date range:', error);
      });
  };

  // Function to handle saving the selected date range
// Function to handle saving the selected date range
const handleSave = () => {
    // Check if a date range is selected
    if (selectedDateRange) {
      // Perform the save operation on the server (optional)
      axios.post('http://localhost:8000/api/bookings', {
        startDate: selectedDateRange.split(' - ')[0],
        endDate: selectedDateRange.split(' - ')[1],
      })
      .then((response) => {
        const newBooking = {
          id: response.data.id,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
        };
        // Update the state with the new booking
        setBookedDates([...bookedDates, newBooking]);
        setSelectedDateRange(null); // Clear the selected date range
        setDateRange([ // Reset the date range to today
        {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      ]); // Clear the date range selection
      })
      .catch((error) => {
        console.error('Error saving date range:', error);
      });
    }
    else if (isMobile && startDateYear && startDateMonth && startDateDay && endDateYear && endDateMonth && endDateDay) {
      // Perform the save operation on the server (optional)
      axios.post('http://localhost:8000/api/bookings', {
        startDate: `${startDateYear}-${startDateMonth}-${startDateDay}`,
        endDate: `${endDateYear}-${endDateMonth}-${endDateDay}`,
      })
      .then((response) => {
        const newBooking = {
          id: response.data.id,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
        };
        // Update the state with the new booking
        setBookedDates([...bookedDates, newBooking]);
        setSelectedDateRange(null); // Clear the selected date range
        setDateRange([ // Reset the date range to today
          {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
          },
        ]); // Clear the date range selection

        // Clear the input fields
        setStartDateYear('');
        setStartDateMonth('');
        setStartDateDay('');
        setEndDateYear('');
        setEndDateMonth('');
        setEndDateDay('');
      })
      .catch((error) => {
        console.error('Error saving date range:', error);
      });
    }
  };

  //Check forever if device is mobile by Setting isMobile to true if the screen width is less than 768px
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850);
  const [startDateYear, setStartDateYear] = useState('');
  const [startDateMonth, setStartDateMonth] = useState('');
  const [startDateDay, setStartDateDay] = useState('');
  const [endDateYear, setEndDateYear] = useState('');
  const [endDateMonth, setEndDateMonth] = useState('');
  const [endDateDay, setEndDateDay] = useState('');
  // Function to handle window resize events
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

  return (
    <div className="book-dates"> {/* Apply the CSS class to the container */}
      <h2>Booked Dates</h2>
      <ul className='bdl'>
        {bookedDates.map((dateRange, index) => (
          <li key={index}>
            Booking: {formatReadableDate(dateRange.startDate)} - {formatReadableDate(dateRange.endDate)}
            <button className="del-button" onClick={() => handleDelete(index)}><span className="material-symbols-outlined">delete</span></button>
          </li>
        ))}
      </ul>
      <h2>Select Date Range</h2>
      <br />

      {isMobile ? (
            <div>
            {/* Wrap date, month, and year input fields in a container */}
            <div className="input-container">
              <div>
                <label>Start Date</label>
                <input
                  type="text"
                  placeholder="DD"
                  onChange={(e) => setStartDateDay(e.target.value)}
                  value={startDateDay}
                  />
                </div>
                <div>
                  <label>Start Month</label>
                  <input
                    type="text"
                    placeholder="MM"
                    onChange={(e) => setStartDateMonth(e.target.value)}
                    value={startDateMonth}
                  />
                </div>
                <div>
                  <label>Start Year</label>
                  <input
                    type="text"
                    placeholder="YYYY"
                    onChange={(e) => setStartDateYear(e.target.value)}
                    value={startDateYear}
                  />
                </div>
              </div>
              <br />
              <center>To</center>
              <br />

              <div className="input-container">
              <div>
                <label>End Date</label>
                <input
                  type="text"
                  placeholder="DD"
                  onChange={(e) => setEndDateDay(e.target.value)}
                  value={endDateDay}
                  />
                </div>
                <div>
                  <label>End Month</label>
                  <input
                    type="text"
                    placeholder="MM"
                    onChange={(e) => setEndDateMonth(e.target.value)}
                    value={endDateMonth}
                  />
                </div>
                <div>
                  <label>End Year</label>
                  <input
                    type="text"
                    placeholder="YYYY"
                    onChange={(e) => setEndDateYear(e.target.value)}
                    value={endDateYear}
                  />
                </div>
              </div>
              {/* Repeat the same structure for the end date */}
            </div>
          ) : (
            <div>
              <DateRangePicker ranges={dateRange} onChange={handleSelect} editableDateInputs={false} /> 
            </div>
          )}

      <br /><br />
      <center><button className="save-button" onClick={handleSave}>Save</button></center> {/* Add a "Save" button */}
    </div>
  );
};

export default BookDates;
