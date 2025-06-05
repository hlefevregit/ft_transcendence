import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CityScene from './views/CityScene';
import LoginForm from './views/LoginForm';
import RegisterForm from './views/RegisterForm';
import Game1 from './views/Game1'
import Settings from './views/Settings/Settings';
import Pong from './views/Pong';

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
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
};
 
export default App;
