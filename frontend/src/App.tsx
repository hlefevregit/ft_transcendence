import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CityScene from './views/CityScene';
import LoginForm from './views/LoginForm';
import RegisterForm from './views/RegisterForm';
import Game1 from './views/Game1';
import Settings from './views/Settings/Settings';
import Pong from './views/Pong';
import BlackJack from './views/BlackJack';
import RequireAuth from './components/RequireAuth';
import YouAreAnIdiot404 from './components/NotFound';
import Game2 from './views/Game2'; // Import Game2
import PixelArtScene from './views/EasterEgg';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<CityScene />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/pong" element={<Pong />} />
        <Route path="/blackjack" element={<BlackJack />} />
        <Route path="/game1" element={<Game1 />} />
        <Route path="/game2" element={<Game2 />} />
        <Route path="/easter-egg" element={<PixelArtScene />} />
        {/* Routes protégées */}
        <Route element={<RequireAuth />}>
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<YouAreAnIdiot404 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
