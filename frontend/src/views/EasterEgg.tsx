import React, { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
// import PlayerSprite from "@/components/PlayerSprite";
import { useNavigate } from "react-router-dom";

export default function PixelArtScene() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const canvas = canvasRef.current!;
		const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true , antialias: false});
		const scene = new BABYLON.Scene(engine);

		// 🌑 Fond noir complet
		scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

		const lowResScale = 4; // Plus grand = plus "gros" pixels
		engine.setHardwareScalingLevel(lowResScale); // 👈 Résolution réduite

		// 🎥 Caméra fixe
		const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 3, -6), scene);
		camera.setTarget(BABYLON.Vector3.Zero());
		camera.inputs.clear(); // Supprimer les contrôles de la caméra
		camera.attachControl(canvas, true);

		// 🕯️ Lumière style vieille ampoule suspendue
		const light = new BABYLON.SpotLight(
			"spotLight",
			new BABYLON.Vector3(2.5, 10, -0.5),        // position
			new BABYLON.Vector3(0, -1, 0),     // direction
			Math.PI / 4,                         // angle (faisceau étroit)
			12,                                  // exponent (concentration)
			scene
		);
		light.diffuse = new BABYLON.Color3(1.0, 0.95, 0.7);  // jaune chaud
		light.intensity = 3;

		const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
		shadowGenerator.useBlurExponentialShadowMap = true;
		shadowGenerator.blurKernel = 16;

		// 💡 Effet vacillant (petite oscillation)
		scene.registerBeforeRender(() => {
			const t = performance.now() * 0.002;
			light.direction = new BABYLON.Vector3(
				Math.sin(t) * 0.3,
				-1,
				Math.cos(t) * 0.3
			);
		});

		// PlayerSprite({
		// 	scene,
		// 	startX: 0,
		// 	startY: -100,
		// 	size: 128,
		// 	spritePaths: {
		// 		idle: "/assets/spriteshesh/City_men_1/Idle.png",
		// 		walk: "/assets/spriteshesh/City_men_1/Walk.png",
		// 		backward: "/assets/spriteshesh/City_men_1/Backward.png",
		// 	},
		// 	leftBoundary: -300,
		// 	rightBoundary: 300,
		// 	onGoLeftBeyond: () => {},
		// 	onGoRightBeyond: () => {},
		// });
		

		
		
		// 🎨 Chargement d'une texture avec fond "F4"
		const graffitiMaterial = new BABYLON.StandardMaterial("graffitiMat", scene);
		graffitiMaterial.diffuseTexture = new BABYLON.Texture("/assets/grafiti.png", scene);
		graffitiMaterial.diffuseTexture.updateSamplingMode(BABYLON.Texture.NEAREST_NEAREST);
		graffitiMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
		graffitiMaterial.specularPower = 16;
		graffitiMaterial.disableLighting = false;
		graffitiMaterial.diffuseTexture!.hasAlpha = true;
		graffitiMaterial.diffuseTexture!.level = 1;
		
		
		// 🧱 Mur visible à la lumière
		const wall = BABYLON.MeshBuilder.CreateBox("wall", {
			width: 5,
			height: 3,
			depth: 0.05
		}, scene);
		wall.position = new BABYLON.Vector3(2, -1, 2);
		wall.material = graffitiMaterial;
		wall.receiveShadows = true;
		
		scene.ambientColor = new BABYLON.Color3(0, 0, 0); // No ambient light
		
		
		scene.onKeyboardObservable.add((kb) => {
			if (kb.type === BABYLON.KeyboardEventTypes.KEYDOWN && kb.event.key === "Backspace") {
				navigate("/"); // 🔁 Redirection vers la page d’accueil
			}
		});

	

		
		
		engine.runRenderLoop(() => {
			scene.render();
		});
		
		window.addEventListener("resize", () => engine.resize());
		
		
		// const handler = (e: KeyboardEvent) => {
		// 	if (e.key === "F4") {
		// 		console.log("🔍 F4 pressed, launching easter egg...");
		// 		fetch('/api/launch-easter-egg'); // Appelle ton endpoint backend
		// 	}
		// };
		// window.addEventListener("keydown", handler);
		
		return () => {
			engine.dispose();
			window.removeEventListener("resize", () => engine.resize());
		};
	}, []);
	



	return (
		<div className="city-scene">
			<canvas ref={canvasRef} style={{ width: "100vw", height: "100vh", display: "block" }} />
		</div>
	);
}
