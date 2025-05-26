import React, { useEffect, useState, useRef } from 'react';
import background from '@/assets/3.jpg';
import '@/styles/style.css';
import { useNavigate } from 'react-router-dom';
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";


interface UserProfile {
	id: number;
	email: string;
	pseudo: string;
	avatarUrl?: string;
	status: string;
	twoFAEnabled: boolean;
}

interface Friend {
	id: number;
	pseudo: string;
	avatarUrl?: string;
	status?: string;
}

interface FriendRequest {
	id: number;
	from: Friend;
	to: Friend;
}

const Settings: React.FC = () => {
	
	const navigate = useNavigate();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [totp, setTotp] = useState('');
	
	
	const [user, setUser] = useState<UserProfile | null>(null);
	const [pseudo, setPseudo] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [status, setStatus] = useState('offline');
	const [error, setError] = useState('');
	const [twoFAEnabled, setTwoFAEnabled] = useState(false);
	
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};
	
	const handleSave = async () => {
		try {
		
			const token = localStorage.getItem('authToken');
			if (!token) throw new Error('No token');
		
			const res = await fetch('/api/user/me', {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
				body: JSON.stringify({ pseudo, avatarUrl, status }),
			});
		
			if (!res.ok) throw new Error();
		
			const updatedUser = await res.json();
			setUser(updatedUser);
			alert('Profil mis à jour !');
		} catch {
			setError('Échec de la mise à jour du profil.');
		}
	};
	
	const handleLogout = () => {
		localStorage.removeItem('authToken');
		navigate('/login');
	};

	
	
	const [friends, setFriends] = useState<Friend[]>([]);
	const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
	const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
	const [newFriendPseudo, setNewFriendPseudo] = useState('');
	
	const token = localStorage.getItem('authToken');
	if (!token) {
		return (
			<div className="relative w-screen h-screen">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />
			<div className="text-white z-10 relative text-center mt-10">Chargement...</div>
			</div>
		);
	}
	
	const headers = {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
		
	};
	
	const fetchFriends = async () => {
		const res = await fetch('/api/friends', { headers });
		const data = await res.json();
		console.log('👥 Friends response:', data);
		setFriends(data.friends);
	};
	
	const fetchSentRequests = async () => {
		
		const [receivedRes, sentRes] = await Promise.all([
			fetch('/api/friends/requests/received', { headers }),
			fetch('/api/friends/requests/sent', { headers }),
		]);
		
		const received = await receivedRes.json();
		const sent = await sentRes.json();
		setReceivedRequests(received);
		setSentRequests(sent);
	};
	
	useEffect(() => {
		
		fetchFriends();
		fetchSentRequests();
	}, []);
	
	
	
	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (!token) {
			navigate('/login');
		}
		console.log('Token:', token);
	}, [navigate]);
	
	const fetchUser = async () => {
		try {
			const token = localStorage.getItem('authToken');
			if (!token) throw new Error('No token');
			
			const res = await fetch('/api/me', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
			});
			
			if (!res.ok) throw new Error('Fetch failed');
			const data = await res.json();
			if (!data || !data.id) throw new Error("Invalid user data");
			
			setUser(data);
			setPseudo(data.pseudo);
			setAvatarUrl(data.avatarUrl || '');
			setStatus(data.status);
			setTwoFAEnabled(data.twoFAEnabled);
			console.log('2FA Enabled:', data.twoFAEnabled);
		} catch (err) {
			setError('Failed to load profile');
		}
		// console.log('User data fetched:', user);
	};

	useEffect(() => {
		fetchUser();
	}, []);
	
	
	
	useEffect(() => {
		let engine: BABYLON.Engine | null = null;
		let scene: BABYLON.Scene | null = null;
		let animationFrameId: number;

		
		const tryInit = () => {
			const canvas = canvasRef.current;
			
			if (!canvas) {
				// 🕐 Réessaie au frame suivant si le canvas n'est pas prêt
				animationFrameId = requestAnimationFrame(tryInit);
				return;
			}
			
			canvas.focus();
			console.log("✅ Canvas détecté", canvas);

			engine = new BABYLON.Engine(canvas, true);
			scene = new BABYLON.Scene(engine);

			const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 20), scene);
			camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
			camera.orthoTop = +300;
			camera.orthoBottom = -300;
			camera.orthoLeft = +400;
			camera.orthoRight = -400;
			camera.setTarget(BABYLON.Vector3.Zero());

			const backgroundMaterial = new BABYLON.StandardMaterial("bgMat", scene);
			const texture = new BABYLON.Texture("/assets/3.jpg", scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, null, (msg, err) => {
				console.error("Erreur chargement texture:", msg, err);
			});
			texture.uScale = 1;
			texture.vScale = -1;
			backgroundMaterial.diffuseTexture = texture;
			backgroundMaterial.backFaceCulling = false;
			backgroundMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

			const backgroundPlane = BABYLON.MeshBuilder.CreatePlane("bg", { width: 800, height: 600 }, scene);
			backgroundPlane.material = backgroundMaterial;
			backgroundPlane.position.z = 10;

			const spriteManager = {
				idle: new BABYLON.SpriteManager("idle", "/assets/spriteshesh/City_men_1/Idle.png", 1, { width: 128, height: 128 }, scene),
				walk: new BABYLON.SpriteManager("walk", "/assets/spriteshesh/City_men_1/Walk.png", 1, { width: 128, height: 128 }, scene),
				backward: new BABYLON.SpriteManager("backward", "/assets/spriteshesh/City_men_1/Backward.png", 1, { width: 128, height: 128 }, scene),
			};

			const idleSprite = new BABYLON.Sprite("idle", spriteManager.idle);
			const walkSprite = new BABYLON.Sprite("walk", spriteManager.walk);
			const backwardSprite = new BABYLON.Sprite("backward", spriteManager.backward);

			[idleSprite, walkSprite, backwardSprite].forEach(sprite => {
				sprite.position.y = -100;
				sprite.size = 256;
				sprite.isVisible = false;
				sprite.position.z = 15;
				sprite.position.x = -200;
			});

			idleSprite.invertU = true;
			idleSprite.isVisible = true;
			let activeSprite = idleSprite;

			let movingRight = false;
			let movingLeft = false;

			scene.onKeyboardObservable.add(kb => {
				if (kb.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
					if (kb.event.key === "ArrowRight") movingRight = true;
					if (kb.event.key === "ArrowLeft") movingLeft = true;
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
				} else if (movingLeft) {
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
				} else if (nextSprite === backwardSprite) {
					backwardSprite.cellIndex = 9 - Math.floor((Date.now() / 100) % 10);
				} else {
					idleSprite.cellIndex = Math.floor((Date.now() / 100) % 6);
				}

				if (activeSprite.position.x < -390) {
					navigate("/game1");
				}
			});

			engine.runRenderLoop(() => {
				scene?.render();
			});

			window.addEventListener("resize", () => engine?.resize());
		};

		animationFrameId = requestAnimationFrame(tryInit);

		return () => {
			cancelAnimationFrame(animationFrameId);
			engine?.dispose();
			scene?.dispose();
		};
	}, [navigate]);


	if (!user) return <div>Loading...</div>;

	const sendRequest = async () => {
		const token = localStorage.getItem('authToken');
		await fetch('/api/friends/request', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		  },
		  body: JSON.stringify({ pseudo: newFriendPseudo }),
		});
	  
		await fetchSentRequests();
	  };
	  
	  const acceptRequest = async (requestId: number) => {
		const token = localStorage.getItem('authToken');
		await fetch(`/api/friends/request/${requestId}/accept`, {
		  method: 'POST',
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
	  
		await Promise.all([fetchFriends(), fetchSentRequests()]);
	  };
	  
	  const refuseRequest = async (requestId: number) => {
		const token = localStorage.getItem('authToken');
		await fetch(`/api/friends/request/${requestId}/refuse`, {
		  method: 'POST',
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
	  
		await fetchSentRequests();
	  };
	  
	  const removeFriend = async (friendId: number) => {
		const token = localStorage.getItem('authToken');
		await fetch(`/api/friends/${friendId}`, {
		  method: 'DELETE',
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
	  
		await fetchFriends();
	  };

	const handleEnable2FA = async () => {
		const token = localStorage.getItem("authToken");
		try {
			const res = await fetch("https://localhost:3000/api/2fa/enable", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ userId: user?.id }), // ou pas nécessaire si extrait du JWT
			});

			const data = await res.json();
			if (res.ok) {
			setQrCodeUrl(data.qrCode);
			console.log("🔐 QR Code URL:", data.qrCode); // ou affiche-le avec <img src={data.qrCode} />
			} else {
			alert(data.error || "Échec de l'activation 2FA");
			}
		} catch (err) {
			console.error("Erreur activation 2FA:", err);
		}
	};


	const verify2FA = async () => {
		const token = localStorage.getItem('authToken');
		if (!token) return;

		const res = await fetch('/api/2fa/verify', {
			method: 'POST',
			headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: totp }),
		});

		if (res.ok) {
			alert("2FA activée !");
			setQrCodeUrl(null); // ⛔️ Retire le QR code de l’affichage
			await fetchUser(); // ⏩ Recharge les données utilisateur
		} else {
			alert("Code invalide");
		}
	};


	const handleDisable2FA = async () => {
		const confirmDisable = window.confirm("Es-tu sûr de vouloir désactiver la 2FA ?");
		if (!confirmDisable) return;

		try {
			const res = await fetch('/api/2fa/disable', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ userId: user?.id }), // ou pas nécessaire si extrait du JWT
			});
			if (!res.ok) throw new Error();

			alert("✅ 2FA désactivée !");
			await fetchUser(); // ⏩ Recharge les données utilisateur
		} catch (err) {
			alert("❌ Échec de la désactivation de la 2FA.");
			await fetchUser(); // ⏩ Recharge les données utilisateur pour refléter l'état actuel
		}
	};




	return (
		
		<div className="settings-scene relative w-screen h-screen overflow-hidden">
			<canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" id="babylon-canvas" />
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-8 rounded-lg shadow-lg w-[80%] max-w-5xl flex gap-8 z-20">
				{/* Colonne gauche : paramètres */}
				<div className="w-1/2 space-y-4">
					<h1 className="text-3xl font-bold mb-6 text-center">Profile Settings</h1>

					<div>
					<label className="block text-sm font-medium">Pseudo</label>
					<input
						type="text"
						value={pseudo}
						onChange={(e) => setPseudo(e.target.value)}
						className="w-full border border-gray-300 rounded p-2 mt-1"
					/>
					</div>

					<div>
					<label className="block text-sm font-medium">Avatar</label>
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						ref={avatarUrl ? null : fileInputRef}
						className="w-full border border-gray-300 rounded p-2 mt-1 bg-white"
					/>
					</div>

					<div>
					<div className="mt-6">
						{!user?.twoFAEnabled && (
						<div className="text-red-500 text-sm mb-2">
						<h2 className="text-xl font-semibold mb-2">🔐 Two-Factor Authentication (2FA)</h2>
						<button
							onClick={handleEnable2FA}
							className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
						>
							Activer la 2FA
						</button>
						</div>
						)}
						{qrCodeUrl && !user?.twoFAEnabled && (
						<div className="mt-4 text-center">
							<p className="text-sm mb-2">Scanne ce QR code avec ton app d’authentification :</p>
							<img src={qrCodeUrl} alt="QR Code 2FA" className="mx-auto w-48 h-48" />
							<label className="block text-sm font-medium">Code 2FA</label>
							<input
								type="text"
								value={totp}
								onChange={(e) => setTotp(e.target.value)}
								placeholder="123456"
								className="w-full border border-gray-300 rounded p-2 mt-1"
								/>
							<button
								onClick={verify2FA}
								className="w-full mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
								>
								Vérifier Code
							</button>
						</div>
						)}

					</div>
					{twoFAEnabled && (
					<div className="mt-6 text-center">
						<p className="text-sm">2FA is enabled for your account.</p>						
					</div>
					)}
					{twoFAEnabled && (
					<button
						onClick={handleDisable2FA}
						className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mt-2"
					>
						Désactiver la 2FA
					</button>
					)}
					<label className="block text-sm font-medium">Status</label>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className="w-full border border-gray-300 rounded p-2 mt-1"
					>
						<option value="active">Active</option>
						<option value="offline">Offline</option>
					</select>
					</div>

					<button
					onClick={handleSave}
					className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
					Save
					</button>

					{error && <div className="text-red-500 text-sm mt-2">{error}</div>}

					{avatarUrl && (
					<div className="mt-6 text-center">
						<img
						src={avatarUrl}
						alt="Avatar"
						className="w-24 h-24 mx-auto rounded-full border"
						/>
					</div>
					)}

					<button
					onClick={handleLogout}
					className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
					>
					Logout
					</button>
				</div>

				{/* Colonne droite : amis */}
				<div className="w-1/2 text-black space-y-6 max-h-[80vh] overflow-y-auto pr-2">
					<h2 className="text-xl font-semibold">👥 Friends</h2>
					<ul className="space-y-2">
					{friends.map((f) => (
						<li
						key={f.id}
						className="flex items-center justify-between bg-white/90 p-2 rounded"
						>
						<div className="flex items-center gap-2">
							{/* ✅ Pastille */}
							<span
							className={`inline-block w-3 h-3 rounded-full ${
								f.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
							}`}
							title={f.status === 'active' ? 'Online' : 'Offline'}
							></span>

							{/* ✅ Avatar si dispo */}
							{f.avatarUrl && (
							<img
								src={f.avatarUrl}
								alt="avatar"
								className="w-6 h-6 rounded-full object-cover"
							/>
							)}

							<span>{f.pseudo}</span>
						</div>

						{/* ✅ Supprimer */}
						<button
							className="text-sm bg-red-500 text-white px-2 py-1 rounded"
							onClick={() => removeFriend(f.id)}
						>
							Remove
						</button>
						</li>
					))}
					</ul>

					<h2 className="text-xl font-semibold">📥 Received Requests</h2>
					<ul className="space-y-2">
					{receivedRequests.map((r) => (
						<li key={r.id} className="flex items-center justify-between bg-white/90 p-2 rounded">
						<span>{r.from.pseudo}</span>
						<div className="space-x-2">
							<button onClick={() => acceptRequest(r.id)} className="bg-green-500 text-white px-2 py-1 rounded">Accept</button>
							<button onClick={() => refuseRequest(r.id)} className="bg-gray-500 text-white px-2 py-1 rounded">Refuse</button>
						</div>
						</li>
					))}
					</ul>

					<h2 className="text-xl font-semibold">📤 Sent Requests</h2>
					<ul className="space-y-2">
					{sentRequests.map((r) => (
						<li key={r.id} className="bg-white/90 p-2 rounded">
						To: {r.to.pseudo}
						</li>
					))}
					</ul>

					<div className="mt-4">
					<h2 className="text-xl font-semibold mb-2">➕ Send Friend Request</h2>
					<input
						type="pseudo"
						value={newFriendPseudo}
						onChange={(e) => setNewFriendPseudo(e.target.value)}
						placeholder="Pseudo"
						className="border border-gray-300 rounded p-2 mr-2"
					/>
					<button
						onClick={sendRequest}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
						Send
					</button>
					</div>
				</div>
			</div>

		</div>
	);
};

export default Settings;

