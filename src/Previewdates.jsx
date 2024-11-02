import React, { useState , useRef , useEffect  } from 'react';
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import axios from 'axios';
import './Previewdates.css';

const Previewdates = () => {
  const [selectionRanges, setSelectionRanges] = useState([]);

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

  return (
    <div className='prevcontainer'>
      <h2>Previewdates</h2>
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
  );
};

export default Previewdates;
