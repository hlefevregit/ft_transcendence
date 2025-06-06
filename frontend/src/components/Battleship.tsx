import React, { useRef, useEffect } from 'react';
import BABYLON, { Engine, Scene } from "babylonjs";

type BattleshipProps = {
  engineOptions: BABYLON.EngineOptions
  sceneOptions: BABYLON.SceneOptions
  onRender: (scene: BABYLON.Scene) => void
  onSceneReady:
}

const Battleship = ({engineOptions, sceneOptions, onRender, onSceneReady, ...rest}: BattleshipProps) => {
  const reactCanvas = useRef(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas);
    const scene = new Scene(engine, sceneOptions);
    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
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
  }, [engineOptions, sceneOptions, onRender, onSceneReady]);

    return <canvas ref={reactCanvas} {...rest} />;
};

export default Battleship