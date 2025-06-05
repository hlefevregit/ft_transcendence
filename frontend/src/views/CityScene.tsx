// src/pages/CityScene.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import * as BABYLON from "@babylonjs/core";
import BabylonScene from "@/components/BabylonScene";
import PlayerSprite from "@/components/PlayerSprite";

export default function CityScene() {
  const navigate = useNavigate();

  const handleSceneReady = (
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    camera: BABYLON.FreeCamera
  ) => {
    PlayerSprite({
      scene,
      startX: 0,
      startY: -200,
      size: 128,
      spritePaths: {
        idle: "/assets/spriteshesh/City_men_1/Idle.png",
        walk: "/assets/spriteshesh/City_men_1/Walk.png",
        backward: "/assets/spriteshesh/City_men_1/Backward.png",
      },
      leftBoundary: -330,
      rightBoundary: 390,
      onGoLeftBeyond: () => {},
      onGoRightBeyond: () => {
        navigate("/login");
      },
    });
  };

  return (
    <div className="city-scene">
      <BabylonScene
        backgroundUrl="/assets/2.jpg"
        onSceneReady={handleSceneReady}
        canvasClassName="city-canvas"
      />
    </div>
  );
}
