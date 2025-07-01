import React, { useEffect, useRef, useState } from "react";

const YouAreAnIdiot404: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    // Initialise l'élément audio en pointant vers ton fichier WAV
    audioRef.current = new Audio("/assets/YouAreAnIdiot_audio.wav");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  const handleUnlock = () => {
    if (audioRef.current && !audioUnlocked) {
      audioRef.current.play()
        .then(() => {
          setAudioUnlocked(true);
          // console.log("Audio activé!");
        })
        .catch((err) => {
          // console.warn("Erreur lors de la lecture audio:", err);
        });
    }
  };

  return (
    <div className="idiot-container" onClick={handleUnlock}>
     
      <style>{`
        .idiot-container {
          position: fixed;
          inset: 0;
          background-size: cover;
          background-position: center;
          animation: flashBg 0.3s steps(1) infinite;
          z-index: 9999;
          cursor: pointer;
        }
        @keyframes flashBg {
          0%, 100% {
            background-image: url("/assets/white404.png");
          }
          50% {
            background-image: url("/assets/black404.png");
          }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  overlayText: {
    color: "white",
    fontSize: "24px",
    fontFamily: '"Comic Sans MS", cursive, sans-serif',
    textAlign: "center",
  },
};

export default YouAreAnIdiot404;
