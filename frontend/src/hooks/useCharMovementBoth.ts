// src/hooks/useCharacterMovement.ts
import { useEffect } from 'react';

export const useCharacterMovementBoth = () => {
  useEffect(() => {
    const scaleFactor = 2;
    let positionX = 0;
    const speed = 20;

    const characterContainer = document.getElementById("character-container") as HTMLElement;
    const character = document.getElementById("character") as HTMLElement;
    const rightZone = document.getElementById("right-zone") as HTMLElement;
    const leftZone = document.getElementById("left-zone") as HTMLElement;
    const screenWidth = window.innerWidth;

    if (!characterContainer || !character || !rightZone || !leftZone) return;

    character.style.transform = `scale(${scaleFactor})`;

    let hasEnteredMuseumZone = false;

    const handleKeyDown = (event: KeyboardEvent) => {
        if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
            character.classList.remove("sprite-idle");
            character.classList.add("sprite-move");
        }
        // else if (["ArrowLeft"].includes(event.key)) {
        //     character.classList.remove("sprite-idle");
        //     character.classList.add("sprite-move-left");
        // }

        if (event.key === "ArrowRight" && positionX + speed < screenWidth - characterContainer.clientWidth) {
            positionX += speed;
        } else if (event.key === "ArrowLeft" && positionX - speed >= -140) {
            positionX -= speed;
        }

        characterContainer.style.transform = `translateX(${positionX}px)`;

        const charRect = characterContainer.getBoundingClientRect();
        const rightZoneRect = rightZone.getBoundingClientRect();
        if (charRect.right > rightZoneRect.left && charRect.left < rightZoneRect.right && !hasEnteredMuseumZone) {
            hasEnteredMuseumZone = true;
            document.dispatchEvent(new CustomEvent("enterMuseumZone"));
        }
        const leftZoneRect = leftZone.getBoundingClientRect();
        if (charRect.right > leftZoneRect.left && charRect.left < leftZoneRect.right) 
        {
            hasEnteredMuseumZone = true;
            document.dispatchEvent(new CustomEvent("enterSettingsZone"));
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
        character.classList.remove("sprite-move");
        character.classList.add("sprite-idle");
      }
      // else if (["ArrowLeft"].includes(event.key)) {
      //   character.classList.remove("sprite-move-left");
      //   character.classList.add("sprite-idle");
      // }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
};
