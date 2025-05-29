 
import { useEffect, useRef } from "react";
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

const BackgroundMusic = () =>
{
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() =>
	{
		const audio = new Audio("/assets/vaporwave.mp3");
		audio.loop = true;
		audio.volume = 1; // Ajuste le volume
		audioRef.current = audio;
		console.log("🎵 Musique de fond chargée");

		const playAudio = () =>
		{
			console.log("🎵 Tentative de lecture de la musique de fond");
			audio.play().catch((e) => { console.warn("🎵 Autoplay bloqué : interaction utilisateur requise."); });
		};

		document.addEventListener("click", playAudio, { once: true });
	}, []);

	return null;
};

export default BackgroundMusic;