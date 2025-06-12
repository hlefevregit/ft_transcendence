import React, { useRef, useEffect } from 'react';
import * as BABYLON from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector"
import { GridMaterial } from '@babylonjs/materials'
import '@/assets/BattleshipMesh'
import { BattleshipMesh, ShipMesh } from '@/assets/BattleshipMesh';

type SceneCanvasProps = {
  engineOptions?: BABYLON.EngineOptions
  sceneOptions?: BABYLON.SceneOptions
  onRender?: (scene: BABYLON.Scene) => void
  onSceneReady: (scene: BABYLON.Scene) => void
}

type ShipType = "Carrier" | "Battleship" | "Destroyer" | "Submarine" | "Patrol"

type PlayerInfo = {
  name: string
  mesh: BattleshipMesh
  ships: Map<string, number[]>
  field: number[]
}

type GameRefType = {
  host: PlayerInfo
  guest: PlayerInfo
  table: BABYLON.Mesh
  camera: BABYLON.ArcRotateCamera
  light: BABYLON.HemisphericLight
  mats: {
    blue: BABYLON.StandardMaterial
    red: BABYLON.StandardMaterial
    white: BABYLON.StandardMaterial
    grid: GridMaterial
  }
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
    console.log(cell.name);
    if (playing == hostName)
      var info = gameRef.current.guest;
    else
      var info = gameRef.current.host;
  }

  const onSceneReady = (scene:BABYLON.Scene) => {
    Inspector.Show(scene, {overlay:true});

    const mats = {
      blue: new BABYLON.StandardMaterial("blue-mat", scene),
      red: new BABYLON.StandardMaterial("red-mat", scene),
      white: new BABYLON.StandardMaterial("white-mat", scene),
      grid: new GridMaterial("grid-mat", scene)
    }
    mats.blue.diffuseColor = new BABYLON.Color3(0,0.27,1);
    mats.red.diffuseColor = new BABYLON.Color3(1,0,0);
    mats.white.diffuseColor = new BABYLON.Color3(1,1,1);
    mats.grid.majorUnitFrequency = 5
    mats.grid.gridRatio = 0.9
    mats.grid.gridOffset.z += 0.3

    const host = {
      name: hostName,
      mesh: new BattleshipMesh(hostName, scene, onClick, mats.blue, mats.grid, new BABYLON.Vector3(0, -4, -5)),
      ships: new Map(),
      field: new Array(100)
    };
    const guest = {
      name: guestName,
      mesh: new BattleshipMesh(guestName, scene, onClick, mats.blue, mats.grid, new BABYLON.Vector3(0, -4, 5), Math.PI),
      ships: new Map(),
      field: new Array(100)
    };

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, Math.PI/3, 25, guest.mesh.field.absolutePosition, scene, true);
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
    light.intensity = 0.7;

    const table = BABYLON.MeshBuilder.CreateCylinder("table", {height:0.3, diameter:40});
    table.position.y = -5;
    table.material = mats.blue;
    table.addChild(host.mesh);
    table.addChild(guest.mesh);

    gameRef.current = {
      host: host,
      guest: guest,
      table: table,
      camera: camera,
      light: light,
      mats: mats,
    };

    scene.onKeyboardObservable.add((kbInfo) => ShipMesh.moveShip(kbInfo))
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