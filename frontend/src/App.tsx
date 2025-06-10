import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CityScene from './views/CityScene';
import LoginForm from './views/LoginForm';
import RegisterForm from './views/RegisterForm';
import Game1 from './views/Game1';
import Settings from './views/Settings/Settings';
import Pong from './views/Pong';
import RequireAuth from './components/RequireAuth';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<CityScene />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Routes protégées */}
        <Route element={<RequireAuth />}>
          <Route path="/game1" element={<Game1 />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pong" element={<Pong />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-white">
              Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
