import React, { useRef, useEffect } from 'react';
import * as BABYLON from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector"
import '@/assets/BattleshipMesh'
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
  camera: BABYLON.FreeCamera
  light: BABYLON.HemisphericLight
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
      const cell: BABYLON.Mesh = evt.source;
      console.log(cell.name)
  }

  const onSceneReady = (scene:BABYLON.Scene) => {
    // Inspector.Show(scene, {});
    const newGame = {
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
      camera: new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 8, -30), scene, true),
      light: new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene)
    }
    newGame.camera.setTarget(BABYLON.Vector3.Zero());
    // newGame.camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    gameRef.current = newGame;
  }

  return (
      <SceneCanvas onSceneReady={onSceneReady}/>
  );
};

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

    engine.runRenderLoop(() => {
      if (typeof onRender === "function")
        onRender(scene);
      scene.render();
    });

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

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Battleship