import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CityScene from './components/CityScene';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MuseumScene from './components/MuseumScene'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CityScene />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/museum" element={<MuseumScene />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
