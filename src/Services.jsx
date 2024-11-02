import React, { useState , useRef , useEffect  } from 'react';
import axios from 'axios';

const Services = () => {
    useEffect(() => {
      // Fetch statistics data from the server
      axios.get('http://localhost:8000/api/ustats/services')
        .then((response) => {
        })
        .catch((error) => {
        });
    }, []);

    return (
        <div>
        
        </div>
    );
};

export default Services;
