import React, { useEffect } from 'react';
import background from '@/assets/3.jpg';
import '@/styles/style.css';
import { useCharacterMovement } from '@/hooks/useCharacterMovement';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
	const navigate = useNavigate();

	// Mouvements perso
	useCharacterMovement();
  
	useEffect(() => {
		const characterContainer = document.getElementById('character-container');
		const museumZone = document.getElementById('museum-zone');
		
		let hasEnteredMuseumZone = false;
	  
		const checkCollision = () => {
		  if (!characterContainer || !museumZone) return;
		  
		  const charRect = characterContainer.getBoundingClientRect();
		  const zoneRect = museumZone.getBoundingClientRect();
	  
		  if (
			charRect.right > zoneRect.left &&
			charRect.left < zoneRect.right &&
			charRect.bottom > zoneRect.top &&
			charRect.top < zoneRect.bottom
		  ) {
			if (!hasEnteredMuseumZone) {
			  hasEnteredMuseumZone = true;
			  navigate('/museum');
			}
		  } else {
			hasEnteredMuseumZone = false;
		  }
		};
	  
		document.addEventListener('keydown', checkCollision);
	  
		return () => {
		  document.removeEventListener('keydown', checkCollision);
		};
	}, [navigate]);

	return (
		<div className='settings-scene'>
		
			<div id="settings-content" className="relative w-screen h-screen overflow-hidden">
				<img
					src={background}
					alt="Background"
					id="background"
					className="absolute w-full h-full object-cover"
				/>
				
				{/* Personnage */}
				<div id="character-container" className="absolute bottom-20 left-40">
					<div id="character" className="sprite-character sprite-idle"></div>
					</div>

					{/* Zone pour aller vers Museum */}
					<div
					id="museum-zone"
					className="absolute bottom-0 left-0 w-32 h-full bg-transparent border border-white"
				></div>
			</div>
		</div>
	);
};

export default Settings;