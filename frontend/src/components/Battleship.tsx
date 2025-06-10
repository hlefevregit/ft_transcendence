import React, { useRef, useEffect } from 'react';
import * as BABYLON from "@babylonjs/core";
import '@/assets/BattleshipMesh'
import { Mesh } from 'babylonjs';
import BattleshipMesh from '@/assets/BattleshipMesh';

type SceneCanvasProps = {
  engineOptions?: BABYLON.EngineOptions
  sceneOptions?: BABYLON.SceneOptions
  onRender?: (scene: BABYLON.Scene) => void
  onSceneReady: (scene: BABYLON.Scene) => void
}

type ShipType = "Battleship" | "Carrier" | "Destroyer" | "Submarine" | "Patrol"

type PlayerInfo = {
  name: string
  mesh: BattleshipMesh
  targets: Map<string, number[]>
  color: BABYLON.Color4
}

type GameRefType = {
  host: PlayerInfo
  guest: PlayerInfo
  camera: BABYLON.TargetCamera
}

// #############################################################################

const Battleship = () => {
  const gameRef = useRef<GameRefType|null>(null);
  const hostName = "host";
  const guestName = "guest";

  const onClick = (ij:number, evt:BABYLON.ActionEvent) => {
      if (!gameRef.current)
        return;
      const playing: string = evt.additionalData;
      const cell: Mesh = evt.source;
  }

  const onSceneReady = (scene:BABYLON.Scene) => {
    gameRef.current = {
      host: {
        name: hostName,
        mesh: new BattleshipMesh(hostName, scene, onClick, new BABYLON.Vector3(0, -4, -5)),
        targets: new Map(),
        color: new BABYLON.Color4(0, 1, 0),
      },
      guest: {
        name: guestName,
        mesh: new BattleshipMesh(guestName, scene, onClick, new BABYLON.Vector3(0, -4, 5), Math.PI),
        targets: new Map(),
        color: new BABYLON.Color4(1, 0, 0),
      },
      camera: new BABYLON.TargetCamera("camera", new BABYLON.Vector3(0, 8, -30), scene),
    }
  }

  return (
    <div>
      <SceneCanvas onSceneReady={onSceneReady}/>
    </div>
  );
}

const SceneCanvas = ({ onRender, onSceneReady }: SceneCanvasProps) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const { current: canvas } = canvasRef;

    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas);
    const scene = new BABYLON.Scene(engine);
    if (scene.isReady())
      onSceneReady(scene);
    else
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));

    if (typeof onRender !== "undefined") {
      engine.runRenderLoop(() => {
        onRender(scene);
        scene.render();
      });
    }

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [onRender, onSceneReady]);

    return <canvas ref={canvasRef} />;
};

export default Battleship