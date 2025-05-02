// src/hooks/useCharacterMovement.ts
import { useEffect } from 'react';

export const useCharacterMovement = () => {
  useEffect(() => {
    const scaleFactor = 2;
    let positionX = 0;
    const speed = 30;

    const characterContainer = document.getElementById("character-container") as HTMLElement;
    const character = document.getElementById("character") as HTMLElement;
    const museumZone = document.getElementById("museum-zone") as HTMLElement;
    const screenWidth = window.innerWidth;

    if (!characterContainer || !character || !museumZone) return;

    character.style.transform = `scale(${scaleFactor})`;

    let hasEnteredMuseumZone = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
        character.classList.remove("sprite-idle");
        character.classList.add("sprite-move");
      }

      if (event.key === "ArrowRight" && positionX + speed < screenWidth - characterContainer.clientWidth) {
        positionX += speed;
      } else if (event.key === "ArrowLeft" && positionX - speed >= -140) {
        positionX -= speed;
      }

      characterContainer.style.transform = `translateX(${positionX}px)`;

      const charRect = characterContainer.getBoundingClientRect();
      const zoneRect = museumZone.getBoundingClientRect();
      if (charRect.right > zoneRect.left && charRect.left < zoneRect.right && !hasEnteredMuseumZone) {
        hasEnteredMuseumZone = true;
        document.dispatchEvent(new CustomEvent("enterMuseumZone"));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
        character.classList.remove("sprite-move");
        character.classList.add("sprite-idle");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
};
