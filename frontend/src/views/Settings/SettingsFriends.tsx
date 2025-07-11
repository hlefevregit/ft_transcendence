// src/components/SettingsFriends.tsx
import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  FaArrowRight,
  FaArrowDown,
  FaTimes,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import "@/styles/SettingsFriends.css";
import ConfirmationDialog from "@/components/ConfirmationDialog";

interface User {
  id: number;
  pseudo: string;
  avatarUrl?: string;
  status?: string;
}

interface SentRequest {
  id: number;
  to: User;
}

interface ReceivedRequest {
  id: number;
  from: User;
}

export default function SettingsFriends() {
  // ──────────────────────────────────────────────
  // États locaux
  // ──────────────────────────────────────────────
  const [newFriendPseudo, setNewFriendPseudo] = useState<string>("");
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ReceivedRequest[]>([]);
  const [error, setError] = useState<string>("");

  // Pour la confirmation de suppression
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  // Ouverture des sections
  const [sentOpen, setSentOpen] = useState<boolean>(false);
  const [receivedOpen, setReceivedOpen] = useState<boolean>(false);
  const [friendsOpen, setFriendsOpen] = useState<boolean>(false);

  // ──────────────────────────────────────────────
  // Préparer l’en‐tête Authorization avec JWT
  // ──────────────────────────────────────────────
  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ──────────────────────────────────────────────
  // Récupérer amis et demandes depuis l’API
  // ──────────────────────────────────────────────
  const fetchFriendsData = async () => {
    setError("");
    const headers = { ...getAuthHeader() };

    try {
      // 1) Amis
      const resFriends = await fetch("/api/friends", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!resFriends.ok) throw new Error("Échec récupération amis");
      const { friends: friendsList } = await resFriends.json();
      setFriends(friendsList);

      // 2) Demandes envoyées
      const resSent = await fetch("/api/friends/requests/sent", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!resSent.ok) throw new Error("Échec récupération demandes envoyées");
      const sent = await resSent.json();
      setSentRequests(sent);

      // 3) Demandes reçues
      const resReceived = await fetch("/api/friends/requests/received", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!resReceived.ok) throw new Error("Échec récupération demandes reçues");
      const received = await resReceived.json();
      setReceivedRequests(received);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors du chargement");
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  // ──────────────────────────────────────────────
  // Envoyer une nouvelle demande d’ami
  // ──────────────────────────────────────────────
  const sendFriendRequest = async () => {
    const pseudo = newFriendPseudo.trim();
    if (!pseudo) return;
    setError("");

    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pseudo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Échec envoi demande");
      }
      setNewFriendPseudo("");
      fetchFriendsData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'envoi");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendFriendRequest();
  };

  // ──────────────────────────────────────────────
  // Annuler / accepter / refuser / supprimer
  // ──────────────────────────────────────────────
  const cancelSentRequest = async (id: number) => {
    setError("");
    try {
      const res = await fetch(`/api/friends/request/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec annulation");
      fetchFriendsData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur annulation");
    }
  };

  const acceptReceivedRequest = async (id: number) => {
    setError("");
    try {
      const res = await fetch(`/api/friends/request/${id}/accept`, {
        method: "POST",
        headers: getAuthHeader(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec acceptation");
      fetchFriendsData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur acceptation");
    }
  };

  const declineReceivedRequest = async (id: number) => {
    setError("");
    try {
      const res = await fetch(`/api/friends/request/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec refus");
      fetchFriendsData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur refus");
    }
  };

  const removeFriend = async (id: number) => {
    setError("");
    try {
      const res = await fetch(`/api/friends/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec suppression");
      fetchFriendsData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur suppression");
    }
  };

  // ──────────────────────────────────────────────
  // Gestion de la dialog de confirmation
  // ──────────────────────────────────────────────
  const handleRemoveClick = (friend: User) => {
    setSelectedFriend(friend);
    setDialogVisible(true);
  };
  const handleConfirmRemove = () => {
    if (selectedFriend) removeFriend(selectedFriend.id);
    setDialogVisible(false);
    setSelectedFriend(null);
  };
  const handleCancelRemove = () => {
    setDialogVisible(false);
    setSelectedFriend(null);
  };

  // ──────────────────────────────────────────────
  // Rendu
  // ──────────────────────────────────────────────
  return (
    <section className="friends-section">
      {/* Add Friend sticky */}
      <div className="section-add open">
        <div className="friend-input-row">
          <input
            type="text"
            placeholder="Add friend"
            value={newFriendPseudo}
            onChange={e => setNewFriendPseudo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="friend-input"
          />
          <button
            onClick={sendFriendRequest}
            className="send-button"
            title="Send request"
          >
            <FaArrowRight />
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Confirmation de suppression */}
      {dialogVisible && selectedFriend && (
        <ConfirmationDialog
          message={`Do you really want to remove ${selectedFriend.pseudo} ?`}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}

      {/* Bloc scrollable pour toutes les sections */}
      <div className="scrollable-block">
        {/* Sent Requests */}
        <div className="dropdown-header" onClick={() => setSentOpen(o => !o)}>
          <span>Sent Requests ({sentRequests.length})</span>
          <FaArrowDown className={sentOpen ? "open" : ""} />
        </div>
        <div className={`section-content ${sentOpen ? "open" : ""}`}>
          <ul className="dropdown-list">
            {sentRequests.length === 0 ? (
              <li className="dropdown-item-empty">No sent requests</li>
            ) : (
              sentRequests.map(r => (
                <li key={r.id} className="dropdown-item">
                  <div className="item-left">
                    <img src={r.to.avatarUrl || "/default-avatar.png"} alt="" className="item-avatar" />
                    <span className="item-pseudo">{r.to.pseudo}</span>
                  </div>
                  <button
                    onClick={() => cancelSentRequest(r.id)}
                    className="item-action-button"
                    title="Cancel request"
                  >
                    <FaTimes />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Received Requests */}
        <div className="dropdown-header" onClick={() => setReceivedOpen(o => !o)}>
          <span>Received Requests ({receivedRequests.length})</span>
          <FaArrowDown className={receivedOpen ? "open" : ""} />
        </div>
        <div className={`section-content ${receivedOpen ? "open" : ""}`}>
          <ul className="dropdown-list">
            {receivedRequests.length === 0 ? (
              <li className="dropdown-item-empty">No received requests</li>
            ) : (
              receivedRequests.map(r => (
                <li key={r.id} className="dropdown-item">
                  <div className="item-left">
                    <img src={r.from.avatarUrl || "/default-avatar.png"} alt="" className="item-avatar" />
                    <span className="item-pseudo">{r.from.pseudo}</span>
                  </div>
                  <div className="item-actions-group">
                    <button
                      onClick={() => acceptReceivedRequest(r.id)}
                      className="item-accept-button"
                      title="Accept request"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => declineReceivedRequest(r.id)}
                      className="item-decline-button"
                      title="Decline request"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Friends List */}
        <div className="dropdown-header" onClick={() => setFriendsOpen(o => !o)}>
          <span>Friends ({friends.length})</span>
          <FaArrowDown className={friendsOpen ? "open" : ""} />
        </div>
        <div className={`section-content ${friendsOpen ? "open" : ""}`}>
          <ul className="dropdown-list">
            {friends.length === 0 ? (
              <li className="dropdown-item-empty">No friends yet</li>
            ) : (
              friends.map(f => (
                <li key={f.id} className="dropdown-item">
                  <div className="item-left">
                    <img src={f.avatarUrl || "/default-avatar.png"} alt="" className="item-avatar" />
                    <div className="item-text-group">
                      <span className="item-pseudo">{f.pseudo}</span>
                      <span className="item-status">
                        {f.status === "active" ? "online" : "offline"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveClick(f)}
                    className="item-remove-button"
                    title="Remove friend"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
