// src/components/BabylonScene.tsx
import React, { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

interface BabylonSceneProps {
  backgroundUrl: string;
  onSceneReady: (
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    camera: BABYLON.FreeCamera
  ) => void;
  canvasClassName?: string;
}

const BabylonScene: React.FC<BabylonSceneProps> = ({
  backgroundUrl,
  onSceneReady,
  canvasClassName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("BabylonScene : canvas introuvable");
      return;
    }

    // 1) Rendre le canvas focusable et lui donner le focus
    canvas.tabIndex = 0;
    canvas.style.outline = "none";
    canvas.focus();

    // 2) Si on clique sur le canvas, on redonne le focus
    canvas.addEventListener("pointerdown", () => {
      canvas.focus();
    });

    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Caméra orthographique
    const camera = new BABYLON.FreeCamera(
      "camera",
      new BABYLON.Vector3(0, 0, 20),
      scene
    );
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = +300;
    camera.orthoBottom = -300;
    camera.orthoLeft = +400;
    camera.orthoRight = -400;
    camera.setTarget(BABYLON.Vector3.Zero());

    // Plan de fond
    const backgroundMaterial = new BABYLON.StandardMaterial("bgMat", scene);
    const texture = new BABYLON.Texture(
      backgroundUrl,
      scene,
      false,
      false,
      BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
      null,
      (msg, err) => {
        console.error("BabylonScene : erreur chargement texture :", msg, err);
      }
    );
    texture.uScale = 1;
    texture.vScale = -1;
    backgroundMaterial.diffuseTexture = texture;
    backgroundMaterial.backFaceCulling = false;
    backgroundMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    const backgroundPlane = BABYLON.MeshBuilder.CreatePlane(
      "bg",
      { width: 800, height: 600 },
      scene
    );
    backgroundPlane.material = backgroundMaterial;
    backgroundPlane.position.z = 10;

    // On appelle le callback, qui pourra ajouter les sprites + le onKeyboardObservable
    onSceneReady(scene, engine, camera);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, [backgroundUrl, onSceneReady]);

  return <canvas ref={canvasRef} className={canvasClassName} />;
};

export default BabylonScene;
