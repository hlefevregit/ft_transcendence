// src/pages/Game1.tsx
import React, { useRef, useState } from "react";
import * as game from "@/libs/pongLibs";
import { useNavigate } from "react-router-dom";
import * as BABYLON from "@babylonjs/core";
import BabylonScene from "@/components/BabylonScene";
import PlayerSprite from "@/components/PlayerSprite";
import "@/styles/Game1.css";
import LiveChat from "@/components/LiveChat/LiveChat";

export default function Game1() {
  const navigate = useNavigate();

  const gameModesRef = useRef<game.gameModes>(game.gameModes.none);
  const statesRef = useRef<game.states>(game.states.main_menu);
  const [trigger, setTrigger] = useState(0);

  const handleSceneReady = (
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    camera: BABYLON.FreeCamera
  ) => {
    scene.onKeyboardObservable.add((kb) => {
      if (kb.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        const { key, code, keyCode } = kb.event;
        if (key === "Enter" || code === "Enter" || keyCode === 13) {
          BABYLON.Animation.CreateAndStartAnimation(
            "zoomTop",
            camera,
            "orthoTop",
            30,
            60,
            300,
            10
          );
          BABYLON.Animation.CreateAndStartAnimation(
            "zoomBottom",
            camera,
            "orthoBottom",
            30,
            60,
            -300,
            -10
          );
          BABYLON.Animation.CreateAndStartAnimation(
            "zoomLeft",
            camera,
            "orthoLeft",
            30,
            60,
            400,
            -50
          );
          BABYLON.Animation.CreateAndStartAnimation(
            "zoomRight",
            camera,
            "orthoRight",
            30,
            60,
            -400,
            50
          );

          setTimeout(() => {
            navigate("/pong");
          }, 1500);
        }
      }
    });

    PlayerSprite({
      scene,
      startX: -150,
      startY: -120,
      size: 256,
      spritePaths: {
        idle: "/assets/spriteshesh/City_men_1/Idle.png",
        walk: "/assets/spriteshesh/City_men_1/Walk.png",
        backward: "/assets/spriteshesh/City_men_1/Backward.png",
      },
      leftBoundary: -250,
      rightBoundary: 250,
      onGoLeftBeyond: () => navigate("/"),
      onGoRightBeyond: () => navigate("/settings"),
    });
  };

  return (
    <>
      <LiveChat
        gameState={statesRef.current}
        gameModesRef={gameModesRef}
        statesRef={statesRef}
        setGameModeTrigger={setTrigger}
        roomIdRef={useRef<string>("")}
      />
      <div className="city-scene">
        <BabylonScene
          backgroundUrl="/assets/4.jpg"
          onSceneReady={handleSceneReady}
          canvasClassName="game1-canvas"
        />
      </div>
    </>
  );
}
