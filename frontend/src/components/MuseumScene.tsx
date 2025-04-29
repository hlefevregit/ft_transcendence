import React, { useEffect } from 'react';
import museumBackground from '@/assets/3.jpg';
import { useNavigate } from 'react-router-dom';
import '@/styles/style.css';
import { useCharacterMovement } from '@/hooks/useCharacterMovement';

const MuseumScene: React.FC = () => {
  const navigate = useNavigate();

  // Active les mouvements du personnage
  useCharacterMovement();

  useEffect(() => {
    const characterContainer = document.getElementById('character-container');
    const leftZone = document.getElementById('left-zone');
    const rightZone = document.getElementById('right-zone');

    if (!characterContainer || !leftZone || !rightZone) return;

    let hasEnteredZone = false;

    const checkCollision = () => {
      const charRect = characterContainer.getBoundingClientRect();
      const leftRect = leftZone.getBoundingClientRect();
      const rightRect = rightZone.getBoundingClientRect();

      if (
        charRect.right > leftRect.left &&
        charRect.left < leftRect.right &&
        charRect.bottom > leftRect.top &&
        charRect.top < leftRect.bottom
      ) {
        if (!hasEnteredZone) {
          hasEnteredZone = true;
          navigate('/');
        }
      } else if (
        charRect.right > rightRect.left &&
        charRect.left < rightRect.right &&
        charRect.bottom > rightRect.top &&
        charRect.top < rightRect.bottom
      ) {
        if (!hasEnteredZone) {
          hasEnteredZone = true;
          navigate('/settings');
        }
      } else {
        hasEnteredZone = false;
      }
    };

    document.addEventListener('keydown', checkCollision);

    return () => {
      document.removeEventListener('keydown', checkCollision);
    };
  }, [navigate]);

  return (
    <div className='museum-scene'>

      <div id="museum-container" className="relative w-screen h-screen overflow-hidden">
        <img
          src={museumBackground}
          alt="Musée"
          id="museum-background"
          className="absolute w-full h-full object-cover"
        />

        {/* Zones de collision */}
        <div
          id="left-zone"
          className="absolute bottom-0 left-10 w-32 h-full bg-transparent border border-blue-500"
        ></div>

        <div
          id="right-zone"
          className="absolute bottom-0 right-20 w-32 h-full bg-transparent border border-green-500"
        ></div>


        {/* Personnage */}
        <div id="character-container" className="absolute bottom-20 left-60">
          <div id="character" className="sprite-character sprite-idle">
          </div>
        </div>

        {/* Titre (optionnel) */}
        <h1 className="text-4xl font-bold z-10 absolute top-10 left-1/2 transform -translate-x-1/2 text-white">
          Bienvenue dans le Musée !
        </h1>
      </div>
    </div>
  );
};

export default MuseumScene;
