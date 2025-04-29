import React, { useEffect } from 'react';
import backgroundImg from '@/assets/2.jpg';
import '../styles/style.css'; 
import { useNavigate } from 'react-router-dom';
import { useCharacterMovement } from '@/hooks/useCharacterMovement';
import { createWebSocket } from '@/services/socket';

const CityScene: React.FC = () => {
  const navigate = useNavigate();

  useCharacterMovement();
  useEffect(() => {
    createWebSocket();

    const handleEnterMuseum = () => navigate('/login');
    document.addEventListener('enterMuseumZone', handleEnterMuseum);

    return () => {
      document.removeEventListener('enterMuseumZone', handleEnterMuseum);
    };
  }, [navigate]);

  return (
    <div id="scene-city" className="scene">
      <div id="game-container" className="relative w-screen h-screen overflow-hidden">
        <img
          src={backgroundImg}
          alt="Background"
          id="background"
          className="absolute w-full h-full object-cover"
        />
        <div id="character-container" className="absolute bottom-20 left-10">
          <div
            id="character"
            className="sprite-character sprite-idle"
          ></div>
        </div>

        <div
          id="museum-zone"
          className="absolute bottom-10 right-10 w-32 h-64 bg-transparent border border-white"
        ></div>
      </div>
    </div>
  );
};

export default CityScene;
