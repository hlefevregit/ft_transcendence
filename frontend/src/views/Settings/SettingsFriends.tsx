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
  const [newFriendPseudo, setNewFriendPseudo] = useState<string>("");
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ReceivedRequest[]>([]);
  const [error, setError] = useState<string>("");

  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  const [sentOpen, setSentOpen] = useState<boolean>(false);
  const [receivedOpen, setReceivedOpen] = useState<boolean>(false);
  const [friendsOpen, setFriendsOpen] = useState<boolean>(false);

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchFriendsData = async () => {
    setError("");
    try {
      const headers = getAuthHeader();
      // amis
      const resF = await fetch("/api/friends", { headers, credentials: "include" });
      if (!resF.ok) throw new Error("Failed to fetch friends");
      const { friends: list } = await resF.json();
      setFriends(list);
      // sent
      const resS = await fetch("/api/friends/requests/sent", { headers, credentials: "include" });
      if (!resS.ok) throw new Error("Failed to fetch sent requests");
      setSentRequests(await resS.json());
      // received
      const resR = await fetch("/api/friends/requests/received", { headers, credentials: "include" });
      if (!resR.ok) throw new Error("Failed to fetch received requests");
      setReceivedRequests(await resR.json());
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur de chargement");
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const sendFriendRequest = async () => {
    setError("");
    const pseudo = newFriendPseudo.trim();
    if (!pseudo) return;
    if (friends.some(f => f.pseudo.toLowerCase() === pseudo.toLowerCase())) {
      setError("Vous êtes déjà ami·e");
      return;
    }
    if (
      sentRequests.some(r => r.to.pseudo.toLowerCase() === pseudo.toLowerCase()) ||
      receivedRequests.some(r => r.from.pseudo.toLowerCase() === pseudo.toLowerCase())
    ) {
      setError("Demande déjà en cours");
      return;
    }
    try {
      const headers = { ...getAuthHeader(), "Content-Type": "application/json" };
      const res = await fetch("/api/friends/request", {
        method: "POST", headers, credentials: "include", body: JSON.stringify({ pseudo })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Échec de l'envoi");
      }
      setNewFriendPseudo("");
      fetchFriendsData();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors de l'envoi");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendFriendRequest();
  };

  const cancelSentRequest = async (id: number) => {
    await fetch(`/api/friends/request/${id}`, { method: "DELETE", headers: getAuthHeader(), credentials: "include" });
    fetchFriendsData();
  };
  const acceptReceivedRequest = async (id: number) => {
    await fetch(`/api/friends/request/${id}/accept`, { method: "POST", headers: getAuthHeader(), credentials: "include" });
    fetchFriendsData();
  };
  const declineReceivedRequest = async (id: number) => {
    await fetch(`/api/friends/request/${id}`, { method: "DELETE", headers: getAuthHeader(), credentials: "include" });
    fetchFriendsData();
  };
  const removeFriend = async (id: number) => {
    await fetch(`/api/friends/${id}`, { method: "DELETE", headers: getAuthHeader(), credentials: "include" });
    fetchFriendsData();
  };

  const handleRemoveClick = (f: User) => {
    setSelectedFriend(f);
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

  return (
    <section className="friends-section">
      {/* Add Friend (design original) */}
      <div className={`section-add open`}>
        <div className="friend-input-row">
          <input
            type="text"
            placeholder="Add friend"
            value={newFriendPseudo}
            onChange={e => { setNewFriendPseudo(e.target.value); if (!e.target.value.trim()) setError(""); }}
            onKeyDown={handleKeyDown}
            className="friend-input"
          />
          <button onClick={sendFriendRequest} className="send-button" title="Send request">
            <FaArrowRight />
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      {dialogVisible && selectedFriend && (
        <ConfirmationDialog
          message={`Do you really want to remove ${selectedFriend.pseudo} ?`}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}

      {/* Sent Requests */}
      <div className="dropdown-header" onClick={() => setSentOpen(!sentOpen)}>
        <span>Sent Requests ({sentRequests.length})</span>
        <FaArrowDown className={sentOpen ? "open" : ""} />
      </div>
      <div className={`section-content ${sentOpen ? "open" : "closed"}`}>
        <ul className="dropdown-list">
          {sentRequests.length === 0
            ? <li className="dropdown-item-empty">No sent requests</li>
            : sentRequests.map(r =>
              <li key={r.id} className="dropdown-item">
                <div className="item-left">
                  <img src={r.to.avatarUrl || "/default-avatar.png"} alt="" className="item-avatar"/>
                  <span className="item-pseudo">{r.to.pseudo}</span>
                </div>
                <button onClick={() => cancelSentRequest(r.id)} className="item-action-button" title="Cancel">
                  <FaTimes />
                </button>
              </li>
            )
          }
        </ul>
      </div>

      {/* Received Requests */}
      <div className="dropdown-header" onClick={() => setReceivedOpen(!receivedOpen)}>
        <span>Received Requests ({receivedRequests.length})</span>
        <FaArrowDown className={receivedOpen ? "open" : ""} />
      </div>
      <div className={`section-content ${receivedOpen ? "open" : "closed"}`}>
        <ul className="dropdown-list">
          {receivedRequests.length === 0
            ? <li className="dropdown-item-empty">No received requests</li>
            : receivedRequests.map(r =>
              <li key={r.id} className="dropdown-item">
                <div className="item-left">
                  <img src={r.from.avatarUrl || "/default-avatar.png"} alt="" className="item-avatar"/>
                  <span className="item-pseudo">{r.from.pseudo}</span>
                </div>
                <div className="item-actions-group">
                  <button onClick={() => acceptReceivedRequest(r.id)} className="item-accept-button" title="Accept">
                    <FaCheck />
                  </button>
                  <button onClick={() => declineReceivedRequest(r.id)} className="item-decline-button" title="Decline">
                    <FaTimes />
                  </button>
                </div>
              </li>
            )
          }
        </ul>
      </div>

      {/* Friends List */}
      <div className="dropdown-header" onClick={() => setFriendsOpen(!friendsOpen)}>
        <span>Friends ({friends.length})</span>
        <FaArrowDown className={friendsOpen ? "open" : ""} />
      </div>
      <div className={`section-content ${friendsOpen ? "open" : "closed"}`}>
        <ul className="dropdown-list">
          {friends.length === 0
            ? <li className="dropdown-item-empty">No friends yet</li>
            : friends.map(f =>
              <li key={f.id} className="dropdown-item">
                <div className="item-left">
                  <img src={f.avatarUrl || "/default-avatar.png"} alt="" className="item-avatar"/>
                  <div className="item-text-group">
                    <span className="item-pseudo">{f.pseudo}</span>
                    <span className="item-status">{f.status === "active" ? "online" : "offline"}</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveClick(f)} className="item-remove-button" title="Remove">
                  <FaTrash />
                </button>
              </li>
            )
          }
        </ul>
      </div>
    </section>
  );
}
