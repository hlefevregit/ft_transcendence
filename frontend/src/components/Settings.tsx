import React, { useEffect, useState, useRef } from 'react';
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
	
	
	const [user, setUser] = useState<UserProfile | null>(null);
	const [pseudo, setPseudo] = useState('');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [status, setStatus] = useState('offline');
	const [error, setError] = useState('');
	
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

	useCharacterMovement();


	const [friends, setFriends] = useState<Friend[]>([]);
	const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
	const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
	const [newFriendEmail, setNewFriendEmail] = useState('');

	const token = localStorage.getItem('authToken');
	if (!token) {
		return;
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
				if (!res.ok) throw new Error('Fetch failed');
				const data = await res.json();
				if (!data || !data.id) throw new Error("Invalid user data");
				
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

	if (!user) return <div>Loading...</div>;
	console.log("✅ Settings rendered !");

	const sendRequest = async () => {
		const token = localStorage.getItem('authToken');
		await fetch('/api/friends/request', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		  },
		  body: JSON.stringify({ email: newFriendEmail }),
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
				<div id="character" className="sprite-character sprite-idle"></div>
			</div>
		
			{/* Zone vers Museum */}
			<div
			id="museum-zone"
			className="absolute bottom-0 left-0 w-32 h-full bg-transparent border border-white z-10"
			></div>
		
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
						<li key={f.id} className="flex items-center justify-between bg-white/90 p-2 rounded">
						<span>{f.pseudo}</span>
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
						type="email"
						value={newFriendEmail}
						onChange={(e) => setNewFriendEmail(e.target.value)}
						placeholder="Email"
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

