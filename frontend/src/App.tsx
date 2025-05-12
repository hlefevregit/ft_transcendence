import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CityScene from './components/CityScene';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MuseumScene from './components/MuseumScene'
import Settings from './components/Settings';
import Battleship from './components/Battleship'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CityScene />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/museum" element={<MuseumScene />} />
        <Route path="/settings" element={<Settings/>} />
		<Route path="/battleship" element={<Battleship/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
