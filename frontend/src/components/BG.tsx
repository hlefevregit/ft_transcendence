import { useEffect, useRef, useState } from "react";
import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';

interface BackgroundMusicProps
{
    pongRef: React.RefObject<game.pongStruct>;
    musicRef: React.RefObject<HTMLAudioElement | null>;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

const	BackgroundMusic: React.FC<BackgroundMusicProps> = ({ pongRef, musicRef, audioRef }) =>
{
const	[isPlaying, setIsPlaying] = useState(false);

useEffect(() =>
{
	if (!musicRef.current)
	{
		const BGMusic = new Audio("/audio/vaporwave.mp3");
		BGMusic.loop = true;
		BGMusic.volume = 0.1;
		BGMusic.muted = true;

		musicRef.current = BGMusic;

		BGMusic.play().then(() =>
		{
			console.log("🎵 Musique auto-démarrée");
			setTimeout(() =>
			{
				BGMusic.muted = false;
				setIsPlaying(true);
			}, 1000);
		})
			.catch((err) =>{ console.warn("🔇 Autoplay bloqué", err); });
	}

	const handleClick = () =>
	{
		const audio = musicRef.current;
		if (!audio) return;

		try 
		{
			if (audio.paused)
			{
				audio.play().then(() =>
				{
					setIsPlaying(true);
					console.log("▶️ Lecture");
				}).catch((err) => {
					console.error("⚠️ Erreur lors de la lecture", err);
				});
			}
			else
			{
				audio.pause();
				setIsPlaying(false);
				console.log("⏸️ Pause");
			}
		}
		catch (err) { console.error("🚫 Erreur audio", err); }
	};

	document.addEventListener("click", handleClick);
	return () =>
	{
		document.removeEventListener("click", handleClick);
		musicRef.current?.pause();
	};



	// AUDIO
	const createBeepSound = (pongRef: React.RefObject<game.pongStruct>) => 
	{
		let audioContext: AudioContext | null = null;
		if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		
		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);
		
		oscillator.frequency.value = 1000; // Frequency in Hz
		oscillator.type = 'sine'; // Type of sound wave
		
		gainNode.gain.setValueAtTime(pongRef.current.soundVolume, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
		
		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.1);
	};

	// const playBeep = createBeepSound();
	const playBeep = () =>
	{
		if (pongRef.current.isButtonHovered)
			createBeepSound(pongRef);
		else console.debug("🎵 SFX not played: button not hovered");
	}

	const audio = new Audio("/assets/vaporwave.mp3");
	if (musicRef && musicRef.current)
	{
		musicRef.current = audio;
		musicRef.current.loop = true;
		musicRef.current.volume = pongRef.current.musicVolume; // Ajuste le volume
		console.log("🎵 Musique de fond chargée");
	}

	const playAudio = () =>
	{
		console.log("🎵 Tentative de lecture de la musique de fond");
		audio.play().catch((e) => { console.warn("🎵 Autoplay bloqué : interaction utilisateur requise."); });
	};

	document.addEventListener("click", playAudio, { once: true });
	document.addEventListener("click", playBeep, { once: false });

	// Update volumes
	const updateMusicVolume = setInterval(() =>
	{
		console.log("current music volume ", pongRef.current.musicVolume , "musicRef volume ", musicRef.current?.volume);
		if (musicRef.current && musicRef.current.volume !== pongRef.current.musicVolume) 
		{
			musicRef.current.volume = pongRef.current.musicVolume;
		}
	}, 200);
	return () => { clearInterval(updateMusicVolume); }
}, []);

return null;
};

export default BackgroundMusic;
