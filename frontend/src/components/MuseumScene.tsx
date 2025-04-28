import React from 'react';
import museumBackground from '@/assets/3.jpg';
import { useNavigate } from 'react-router-dom';
import '@/styles/style.css';

const MuseumScene: React.FC = () => {
  const navigate = useNavigate();
  
  const handleExit = () => {
    navigate('/');
  };

  return (
    <div id="scene-museum" className="scene relative w-screen h-screen flex items-center justify-center text-white">
      <img
        src={museumBackground}
        alt="Musée"
        id="museum-background"
        className="absolute w-full h-full object-cover"
      />
      <h1 className="text-4xl font-bold z-10">Bienvenue dans le Musée !</h1>
      <button
        id="exit-museum"
        onClick={handleExit}
        className="absolute bottom-10 right-10 px-4 py-2 bg-red-600 text-white rounded-lg z-10"
      >
        Quitter le Musée
      </button>
    </div>
  );
};

export default MuseumScene;