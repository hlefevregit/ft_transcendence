import React, { useEffect, useState } from 'react';
import background from '@/assets/3.jpg';
import '@/styles/style.css';
import { useCharacterMovement } from '@/hooks/useCharacterMovement';
import { useNavigate } from 'react-router-dom';


interface UserProfile {
	id: number;
	email: string;
	pseudo: string;
	avatarUrl?: string;
	status: string;
}

const Settings: React.FC = () => {
	const navigate = useNavigate();

	// Mouvements perso
	useCharacterMovement();

	const [user, setUser] = useState<UserProfile | null>(null);
	const [pseudo, setPseudo] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [status, setStatus] = useState('offline');
	const [error, setError] = useState('');

	console.log("✅ Settings component rendered !");

	useEffect(() => {
		const token = localStorage.getItem('authToken');
		if (!token) {
			navigate('/login');
		}
		console.log('Token:', token);
	}, [navigate]);

	useEffect(() => {
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
				console.log('👤');
				if (!res.ok) throw new Error('Fetch failed');
				console.log('Response:', res);
				console.log('Status:', res.status);
				const data = await res.json();
				if (!data || !data.id) throw new Error("Invalid user data");
				console.log('User fetched:', data);

				setUser(data);
				setPseudo(data.pseudo);
				setAvatarUrl(data.avatarUrl || '');
				setStatus(data.status);
			} catch (err) {
				setError('Failed to load profile');
			}
			// console.log('User data fetched:', user);
		};
		fetchUser();
	}, []);
	
	

	console.log("✅ User data fetched !");

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
			alert('Profile updated!');
		} catch {
			setError('Failed to update profile.');
		}
	};
	
	const handleLogout = () => {
		localStorage.removeItem('authToken');
		navigate('/login');
	};
	
	
	useEffect(() => {
		const characterContainer = document.getElementById('character-container');
		const museumZone = document.getElementById('museum-zone');
		
		let hasEnteredMuseumZone = false;
		
		const checkCollision = () => {
			if (!characterContainer || !museumZone) return;
			
			const charRect = characterContainer.getBoundingClientRect();
			const zoneRect = museumZone.getBoundingClientRect();
			
			if (
				charRect.right > zoneRect.left &&
				charRect.left < zoneRect.right &&
				charRect.bottom > zoneRect.top &&
				charRect.top < zoneRect.bottom
			) {
				if (!hasEnteredMuseumZone) {
					hasEnteredMuseumZone = true;
					navigate('/museum');
				}
			} else {
				hasEnteredMuseumZone = false;
			}
		};
		
		document.addEventListener('keydown', checkCollision);
		
		return () => {
			document.removeEventListener('keydown', checkCollision);
		};
	}, [navigate]);
	
	console.log("✅ Checking user data...");
	if (!user) return <div>Loading...</div>;
	console.log("✅ Settings rendered !");
	console.log("User :", user);

	return (
		<div className="settings-scene relative w-screen h-screen overflow-hidden">
			{/* Background */}
			<img
			src={background}
			alt="Background"
			id="background"
			className="absolute w-full h-full object-cover z-0"
			/>
		
			{/* Personnage */}
			<div id="character-container" className="absolute bottom-20 left-40 z-10">
			<div id="character" className="sprite-character sprite-idle" />
			</div>
		
			{/* Zone vers Museum */}
			<div
			id="museum-zone"
			className="absolute bottom-0 left-0 w-32 h-full bg-transparent border border-white z-10"
			></div>
		
			{/* 💡 Formulaire centré */}
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-8 rounded-lg shadow-lg w-96 z-20">
			<h1 className="text-3xl font-bold mb-6 text-center">My Profile Settings</h1>
		
			<div className="space-y-4">
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
				<label className="block text-sm font-medium">Avatar URL</label>
				<input
					type="text"
					value={avatarUrl}
					onChange={(e) => setAvatarUrl(e.target.value)}
					className="w-full border border-gray-300 rounded p-2 mt-1"
				/>
				</div>
		
				<div>
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
			</div>
		</div>
	);
};

export default Settings;