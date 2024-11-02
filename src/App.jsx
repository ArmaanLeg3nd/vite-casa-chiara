import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Auth from './Auth';
import Admin from './Admin';
import PageTransition from './PageTransition';
import LandingPage from './LandingPage';
import VacationRental from './VacationRental';
import Services from './Services';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/vacation-rental" element={<PageTransition><VacationRental /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
      </Routes>
    </div>
  );
}

export default App;
