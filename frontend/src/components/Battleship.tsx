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
  obj: BattleshipMesh
  ships: number[][] | null
  field: number[]
}

type GameRefType = {
  playing: PlayerInfo
  waiting: PlayerInfo
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

  const onClick = (ij:number) => {
    console.log("[DEBUG] onCellClick called")
    if (!gameRef.current || !gameRef.current.waiting.ships)
      return;
    const {playing: {obj}, waiting: {ships}, mats: mats} = gameRef.current;
    const cell = obj.cells[ij];

    cell.mesh.material = null;
    for (const ship of ships) {
      if (ship.includes(ij)) {
        obj.cells[ij].mesh.material = mats.red;
        break;
      }
    }
    if (!cell.mesh.material)
      cell.mesh.material = mats.white;

    cell.mesh.actionManager = null;
    endTurn();
  }

  const onSceneReady = (scene:BABYLON.Scene) => {
    Inspector.Show(scene, {overlay:true});
    scene.actionManager = new BABYLON.ActionManager();

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

    const host: PlayerInfo = {
      name: hostName,
      obj: new BattleshipMesh(hostName, scene, onClick, mats.blue, mats.grid, new BABYLON.Vector3(0, -4, -5)),
      ships: null,
      field: new Array(100)
    };
    const guest = {
      name: guestName,
      obj: new BattleshipMesh(guestName, scene, onClick, mats.blue, mats.grid, new BABYLON.Vector3(0, -4, 5), Math.PI),
      ships: null,
      field: new Array(100)
    };

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, Math.PI/3, 25, BABYLON.Vector3.Zero(), scene, true);
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
    light.intensity = 0.7;

    const table = BABYLON.MeshBuilder.CreateCylinder("table", {height:0.3, diameter:40});
    table.position.y = -5;
    table.material = mats.blue;
    table.addChild(host.obj);
    table.addChild(guest.obj);

    gameRef.current = {
      playing: host,
      waiting: guest,
      table: table,
      camera: camera,
      light: light,
      mats: mats,
    };

    startTurn()
  }

  const startTurn = () => {
    if (!gameRef.current)
      return;
    const {playing: {obj:playObj, ships:playShips}, waiting: {obj: waitObj}} = gameRef.current;

    if (!playShips) return playObj.shipSetup(endTurn);
    playObj.isPlaying = true;
    waitObj.isPlaying = false;
  }

  const endTurn = () => {
    if (!gameRef.current)
      return;
    const {playing: playing, waiting: waiting} = gameRef.current;
    const {obj: obj, ships: ships} = playing;

    if (!ships)
      gameRef.current.playing.ships = obj.shipCoords();

    gameRef.current.waiting = playing;
    gameRef.current.playing = waiting;
    startTurn()
  }

  return <SceneCanvas onSceneReady={onSceneReady}/>
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