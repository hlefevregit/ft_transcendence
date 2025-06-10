import React from 'react';
import { Outlet } from 'react-router-dom';
import NotLogged from '../views/NotLogged';

const RequireAuth: React.FC = () => {
  // on récupère le token
  const token = localStorage.getItem('authToken');

  // si pas connecté, on affiche la page NotLogged
  if (!token) {
    return <NotLogged />;
  }

  // sinon, on laisse passer vers les routes enfants
  return <Outlet />;
};

export default RequireAuth;
