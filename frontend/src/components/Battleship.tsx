import React, { useRef, useEffect } from 'react';
import { MeshBuilder, StandardMaterial, ArcRotateCamera, HemisphericLight,
         Vector3, Color3, ActionManager, Engine, Scene, GlowLayer } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector"
// import 'https://cdn.babylonjs.com/gui/babylon.gui.js'
import { GridMaterial } from '@babylonjs/materials'
import { BattleshipMesh } from '@/assets/BattleshipMesh'
import { SceneCanvasProps, PlayerInfo, GameRefType, MatsRef } from '@/libs/battleshipTypes'

const Battleship = () => {
  const gameRef = useRef<GameRefType|null>(null);
  const hostName = "host";
  const guestName = "guest";

  const onClick = (ij:number) => {
    if (!gameRef.current || !gameRef.current.waiting.ships)
      return;
    const {
      playing: {obj: {cells}},
      waiting: {obj: waitObj, ships},
      mats: mats
    } = gameRef.current;

    cells[ij].actionManager = null;
    cells[ij].material = null;
    for (const [ship, m] of ships) {
      if (!ship.has(ij)) continue;
      ship.delete(ij);
      cells[ij].material = mats.red;

      if (ship.size == 0) {
        ships.delete([ship, m]);
        waitObj.ships[m].mesh.material = mats.red;
        if (ships.size == 0)
          endGame();
      }
    }
    if (!cells[ij].material)
      cells[ij].material = mats.white;

    endTurn();
  }

  const onSceneReady = (scene:Scene) => {
    // Inspector.Show(scene, {overlay:true});
    scene.actionManager = new ActionManager();

    const mats: MatsRef = {
      blue: new StandardMaterial("blue-mat", scene),
      red: new StandardMaterial("red-mat", scene),
      white: new StandardMaterial("white-mat", scene),
      grid: new GridMaterial("grid-mat", scene),
      indic: new StandardMaterial("indic-mat", scene)
    }
    mats.blue.diffuseColor = new Color3(0,0.27,1);
    mats.red.diffuseColor = new Color3(1,0,0);
    mats.white.diffuseColor = new Color3(1,1,1);
    mats.grid.majorUnitFrequency = 5
    mats.grid.gridRatio = 0.9
    mats.grid.gridOffset.z += 0.3
    mats.indic.emissiveColor = new Color3(1,0,0);

    const host: PlayerInfo = {
      obj: new BattleshipMesh(hostName, scene, onClick, mats, mats.grid, new Vector3(0, -4, 6), Math.PI/2),
      ships: null,
    };
    const guest = {
      obj: new BattleshipMesh(guestName, scene, onClick, mats, mats.grid, new Vector3(0, -4, -6), Math.PI/2),
      ships: null,
    };

    const camera = new ArcRotateCamera("camera", Math.PI, 1.237, 27, Vector3.Left(), scene, true);
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    const light = new HemisphericLight("light", new Vector3(0,1,0), scene);
    light.intensity = 0.7;

    const table = MeshBuilder.CreateCylinder("table", {height:0.3, diameter:40});
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
      glow: new GlowLayer("glow", scene),
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

  const endGame = () => {
    if (!gameRef.current)
      return;
    const { playing, waiting } = gameRef.current;

    playing.obj.isPlaying = false

    // TODO: better game ending sequence
  }

  return <SceneCanvas onSceneReady={onSceneReady}/>
};

const SceneCanvas = ({ onRender, onSceneReady }: SceneCanvasProps) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const { current: canvas } = canvasRef;

    if (!canvas) return;

    const engine = new Engine(canvas);
    const scene = new Scene(engine);
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