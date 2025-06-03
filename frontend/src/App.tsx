import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CityScene from './components/CityScene';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Game1 from './components/Game1'
import Settings from './components/Settings';
import Pong from './components/Pong';
import YouAreAnIdiot404 from './components/NotFound';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CityScene />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/game1" element={<Game1 />} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/pong" element={<Pong />} />
        <Route path="*" element={<YouAreAnIdiot404/>} />
      </Routes>
    </BrowserRouter>
  );
};
 
export default App;
