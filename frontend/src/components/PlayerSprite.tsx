// src/components/PlayerSprite.tsx
import * as BABYLON from "@babylonjs/core";
import React from "react";

interface PlayerSpriteProps {
  scene: BABYLON.Scene;
  startX?: number;
  startY?: number;
  size?: number;

  spritePaths: {
    idle: string;
    walk: string;
    backward: string;
  };

  /** Seuil X à gauche qui déclenche une action (et bloquer/passer selon callback) */
  onGoLeftBeyond?: () => void;
  /** Seuil X à droite qui déclenche une action (et bloquer/passer selon callback) */
  onGoRightBeyond?: () => void;
  leftBoundary?: number;
  rightBoundary?: number;
}

const PlayerSprite: React.FC<PlayerSpriteProps> = ({
  scene,
  startX = 0,
  startY = -120,
  size = 256,
  spritePaths,
  onGoLeftBeyond,
  onGoRightBeyond,
  leftBoundary = -250,
  rightBoundary = 250,
}) => {

  const spriteManager = {
    idle: new BABYLON.SpriteManager(
      "idle",
      spritePaths.idle,
      1,
      { width: 128, height: 128 },
      scene
    ),
    walk: new BABYLON.SpriteManager(
      "walk",
      spritePaths.walk,
      1,
      { width: 128, height: 128 },
      scene
    ),
    backward: new BABYLON.SpriteManager(
      "backward",
      spritePaths.backward,
      1,
      { width: 128, height: 128 },
      scene
    ),
  };

  // === Création des 3 sprites ===
  const idleSprite = new BABYLON.Sprite("idle", spriteManager.idle);
  const walkSprite = new BABYLON.Sprite("walk", spriteManager.walk);
  const backwardSprite = new BABYLON.Sprite(
    "backward",
    spriteManager.backward
  );

  [idleSprite, walkSprite, backwardSprite].forEach((sprite) => {
    sprite.position.x = startX;
    sprite.position.y = startY;
    sprite.position.z = 15;
    sprite.size = size;
    sprite.isVisible = false;
  });

  idleSprite.invertU = true;
  idleSprite.isVisible = true;
  let activeSprite = idleSprite;

  let movingRight = false;
  let movingLeft = false;

  // === Gestion clavier ===
  scene.onKeyboardObservable.add((kb) => {
    if (kb.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
      if (kb.event.key === "ArrowRight") movingRight = true;
      if (kb.event.key === "ArrowLeft") movingLeft = true;
    }
    if (kb.type === BABYLON.KeyboardEventTypes.KEYUP) {
      if (kb.event.key === "ArrowRight") movingRight = false;
      if (kb.event.key === "ArrowLeft") movingLeft = false;
    }
  });

  // === Avant chaque Render : mise à jour de la position et de l’animation ===
  scene.onBeforeRenderObservable.add(() => {
    let nextSprite = idleSprite;
    // On prend la position actuelle
    const currentX = activeSprite.position.x;
    let newX = currentX;

    // Si on appuie à droite
    if (movingRight) {
      newX = currentX + 4;
      nextSprite = backwardSprite;
    }
    // Si on appuie à gauche
    else if (movingLeft) {
      newX = currentX - 4;
      nextSprite = walkSprite;
    }

    // --- Gérer la borne droite ---
    if (newX > rightBoundary) {
      // On plafonne toujours la position à rightBoundary
      newX = rightBoundary;
      // Si un callback existe, on l’appelle
      if (onGoRightBeyond) {
        onGoRightBeyond();
      }
    }

    // --- Gérer la borne gauche ---
    if (newX < leftBoundary) {
      newX = leftBoundary;
      if (onGoLeftBeyond) {
        onGoLeftBeyond();
      }
    }

    // Appliquer newX à tous les sprites
    [idleSprite, walkSprite, backwardSprite].forEach((sp) => {
      sp.position.x = newX;
    });

    // Changement de sprite courant si on change d’état
    if (nextSprite !== activeSprite) {
      activeSprite.isVisible = false;
      nextSprite.isVisible = true;
      activeSprite = nextSprite;
    }

    // Cycling des frames d’animation
    if (activeSprite === walkSprite) {
      walkSprite.cellIndex = Math.floor(Date.now() / 100) % 10;
    } else if (activeSprite === backwardSprite) {
      backwardSprite.cellIndex = 9 - (Math.floor(Date.now() / 100) % 10);
    } else {
      idleSprite.cellIndex = Math.floor(Date.now() / 100) % 6;
    }
  });
  Object.values(spriteManager).forEach(manager => {
    manager.texture.updateSamplingMode(BABYLON.Texture.NEAREST_NEAREST);
  });


  return null;

};

export default PlayerSprite;
