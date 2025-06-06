import { act, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { text } from "stream/consumers";

export default function Game1() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }
    canvas.focus();
    const engine = new BABYLON.Engine(canvas!, true);
    const scene = new BABYLON.Scene(engine);


    // Create a camera
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 20), scene);
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = +300;
    camera.orthoBottom = -300;
    camera.orthoLeft = +400;
    camera.orthoRight = -400;

    camera.setTarget(BABYLON.Vector3.Zero());


    // Background

    const backgroundMaterial = new BABYLON.StandardMaterial("bgMat", scene);
    const texture = new BABYLON.Texture("/assets/4.jpg", scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, null, (message, exception) => {
    console.error("Erreur chargement texture :", message, exception);
    });
    texture.uScale = 1;
    texture.vScale = -1;
    backgroundMaterial.diffuseTexture = texture;
    backgroundMaterial.diffuseTexture.hasAlpha = false;
    backgroundMaterial.backFaceCulling = false;
    backgroundMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    const backgroundPlane = BABYLON.MeshBuilder.CreatePlane("bg", { width: 800, height: 600 }, scene);
    backgroundPlane.material = backgroundMaterial;
    backgroundPlane.position.z = 10;



    // new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 0, 0), scene);


    // Sprite manager
    const spriteManager = {
      idle: new BABYLON.SpriteManager("idle", "/assets/spriteshesh/City_men_1/Idle.png", 1, { width: 128, height: 128 }, scene),
      walk: new BABYLON.SpriteManager("walk", "/assets/spriteshesh/City_men_1/Walk.png", 1, { width: 128, height: 128 }, scene),
      backward: new BABYLON.SpriteManager("backward", "/assets/spriteshesh/City_men_1/Backward.png", 1, { width: 128, height: 128 }, scene),
    };

    const idleSprite = new BABYLON.Sprite("idle", spriteManager.idle);
    const walkSprite = new BABYLON.Sprite("walk", spriteManager.walk);
    const backwardSprite = new BABYLON.Sprite("backward", spriteManager.backward);

    [idleSprite, walkSprite, backwardSprite].forEach(sprite => {
      sprite.position.y = -120;
      sprite.size = 256;
      sprite.isVisible = false;
      sprite.position.z = 15;
      sprite.position.x = -150;
    });

    idleSprite.invertU = true;

    idleSprite.isVisible = true;
    let activeSprite = idleSprite;


    let movingRight = false;
    let movingLeft = false;

    // === CLAVIER ===
    scene.onKeyboardObservable.add((kb) => {
      if (kb.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kb.event.key === "ArrowRight") movingRight = true;
        if (kb.event.key === "ArrowLeft") movingLeft = true;

        const tableauPosition = new BABYLON.Vector3(0, -100, 0);
        const distance = BABYLON.Vector3.Distance(activeSprite.position, tableauPosition);
        const interactionDistance = 50;

        if (kb.event.key === "Enter") {
          if (distance < interactionDistance) {
            // 🔍 Zoom sur le tableau
            BABYLON.Animation.CreateAndStartAnimation("zoomTop", camera, "orthoTop", 30, 60, 300, 10);
            BABYLON.Animation.CreateAndStartAnimation("zoomBottom", camera, "orthoBottom", 30, 60, -300, -10);
            BABYLON.Animation.CreateAndStartAnimation("zoomLeft", camera, "orthoLeft", 30, 60, 400, -50);
            BABYLON.Animation.CreateAndStartAnimation("zoomRight", camera, "orthoRight", 30, 60, -400, 50);
  
            // ⏳ Transition vers la scène suivante
            setTimeout(() => {
              navigate("/pong");
            }, 1500);
          }
        }
      }

      if (kb.type === BABYLON.KeyboardEventTypes.KEYUP) {
        if (kb.event.key === "ArrowRight") movingRight = false;
        if (kb.event.key === "ArrowLeft") movingLeft = false;
      }
    });

    scene.onBeforeRenderObservable.add(() => {
      let nextSprite = idleSprite;

      if (movingRight) {
        backwardSprite.position.x += 4;
        nextSprite = backwardSprite;
      }
      else if (movingLeft) {
        walkSprite.position.x -= 4;
        nextSprite = walkSprite;
      }

      [idleSprite, walkSprite, backwardSprite].forEach(sprite => {
        sprite.position.x = activeSprite.position.x;
      });

      if (nextSprite !== activeSprite) {
        activeSprite.isVisible = false;
        nextSprite.isVisible = true;
        activeSprite = nextSprite;
      }

      if (nextSprite === walkSprite) {
        walkSprite.cellIndex = Math.floor((Date.now() / 100) % 10);
      }
      else if (nextSprite === backwardSprite) {
        backwardSprite.cellIndex = 9 - Math.floor((Date.now() / 100) % 10);
      }
      else if (nextSprite === idleSprite) {
        idleSprite.cellIndex = Math.floor((Date.now() / 100) % 6);
      }


      if (activeSprite.position.x > 250) {
        navigate("/settings");
      }
      if (activeSprite.position.x < -250) {
        navigate("/");
      }
    
      
    });

    // === RENDER ===
    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
      scene.dispose();
    };
  }, [navigate]);

  return (
    <div className="city-scene">
      <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
}

