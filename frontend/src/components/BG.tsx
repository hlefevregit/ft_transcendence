import { useEffect, useRef, useState } from "react";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("/audio/vaporwave.mp3");
      audio.loop = true;
      audio.volume = 0.1;
      audio.muted = true;

      audioRef.current = audio;

      audio.play()
        .then(() => {
          console.log("🎵 Musique auto-démarrée");
          setTimeout(() => {
            audio.muted = false;
            setIsPlaying(true);
          }, 1000);
        })
        .catch((err) => {
          console.warn("🔇 Autoplay bloqué", err);
        });
    }

    const handleClick = () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        if (audio.paused) {
          audio.play().then(() => {
            setIsPlaying(true);
            console.log("▶️ Lecture");
          }).catch((err) => {
            console.error("⚠️ Erreur lors de la lecture", err);
          });
        } else {
          audio.pause();
          setIsPlaying(false);
          console.log("⏸️ Pause");
        }
      } catch (err) {
        console.error("🚫 Erreur audio", err);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      audioRef.current?.pause();
    };
  }, []);

  return null;
};

export default BackgroundMusic;
