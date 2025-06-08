import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  FaArrowRight,
  FaArrowDown,
  FaTimes,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import "@/styles/SettingsFriends.css";

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

type SectionKey = "sent" | "received" | "friends" | null;

export default function SettingsFriends() {
  // ──────────────────────────────────────────────
  // 1) États locaux
  // ──────────────────────────────────────────────
  const [newFriendPseudo, setNewFriendPseudo] = useState<string>("");
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ReceivedRequest[]>([]);
  const [error, setError] = useState<string>("");

  // Quelle section est ouverte (ou null si aucune)
  const [openSection, setOpenSection] = useState<SectionKey>(null);

  // ──────────────────────────────────────────────
  // 2) Préparer l’en‐tête Authorization
  // ──────────────────────────────────────────────
  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ──────────────────────────────────────────────
  // 3) Récupérer amis + demandes (séparé en trois blocs)
  // ──────────────────────────────────────────────
  const fetchFriendsData = async () => {
    setError("");

    // 3.1) Récupérer la liste des amis
    try {
      const headers = getAuthHeader();
      const resFriends = await fetch("/api/friends", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!resFriends.ok) throw new Error("Failed to fetch friends");
      const ct = resFriends.headers.get("Content-Type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unexpected response format for friends");
      }
      const { friends: friendsList } = await resFriends.json();
      setFriends(friendsList);
    } catch (err: any) {
      console.error("Error fetching friends:", err);
      setError((prev) => prev || err.message || "Error fetching friends");
      setFriends([]); // on garde au moins un tableau vide
    }

    // 3.2) Récupérer la liste des demandes envoyées
    try {
      const headers = getAuthHeader();
      const resSent = await fetch("/api/friends/requests/sent", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!resSent.ok) throw new Error("Failed to fetch sent requests");
      const ct = resSent.headers.get("Content-Type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unexpected response format for sent requests");
      }
      const sent = await resSent.json();
      setSentRequests(sent);
    } catch (err: any) {
      console.error("Error fetching sent requests:", err);
      setError((prev) => prev || err.message || "Error fetching sent requests");
      setSentRequests([]);
    }

    // 3.3) Récupérer la liste des demandes reçues
    try {
      const headers = getAuthHeader();
      const resReceived = await fetch("/api/friends/requests/received", {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!resReceived.ok) throw new Error("Failed to fetch received requests");
      const ct = resReceived.headers.get("Content-Type") || "";
      if (!ct.includes("application/json")) {
        throw new Error("Unexpected response format for received requests");
      }
      const received = await resReceived.json();
      setReceivedRequests(received);
    } catch (err: any) {
      console.error("Error fetching received requests:", err);
      setError((prev) => prev || err.message || "Error fetching received requests");
      setReceivedRequests([]);
    }
  };

  // ──────────────────────────────────────────────
  // 4) Au montage, on charge les données
  // ──────────────────────────────────────────────
  useEffect(() => {
    fetchFriendsData();
  }, []);

  // ──────────────────────────────────────────────
  // 5) Envoyer une nouvelle demande d’ami
  // ──────────────────────────────────────────────
  const sendFriendRequest = async () => {
    setError("");

    const pseudoTrimmed = newFriendPseudo.trim();
    if (!pseudoTrimmed) {
      // si champ vide, on efface l’erreur et on ne fait rien
      setError("");
      return;
    }

    // 5.1) Vérifier si on est déjà amis
    if (friends.some((f) => f.pseudo.toLowerCase() === pseudoTrimmed.toLowerCase())) {
      setError("User is already your friend");
      return;
    }

    // 5.2) Vérifier si une demande est déjà pendante (envoyée ou reçue)
    const alreadySent = sentRequests.some(
      (r) => r.to.pseudo.toLowerCase() === pseudoTrimmed.toLowerCase()
    );
    const alreadyReceived = receivedRequests.some(
      (r) => r.from.pseudo.toLowerCase() === pseudoTrimmed.toLowerCase()
    );
    if (alreadySent || alreadyReceived) {
      setError("Friend request already pending");
      return;
    }

    try {
      const headers: Record<string, string> = {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      };

      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ pseudo: pseudoTrimmed }),
      });
      if (!res.ok) {
        // Si ce n’est pas JSON, on lève une erreur
        let data: any;
        try {
          data = await res.json();
        } catch {
          throw new Error("Target user not found");
        }
        // Si le message est en français, on le traduit
        if (data.message?.includes("Utilisateur cible introuvable")) {
          throw new Error("Target user not found");
        }
        throw new Error(data.message || "Failed to send request");
      }
      setNewFriendPseudo("");
      // Une fois envoyé, on recharge uniquement la liste “sent” et “received”
      await fetchFriendsData();
    } catch (err: any) {
      console.error("Error sending request:", err);
      setError(err.message || "Error sending request");
    }
  };

  // Si Entrée → envoi
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendFriendRequest();
    }
  };

  // ──────────────────────────────────────────────
  // 6) Annuler une demande envoyée
  // ──────────────────────────────────────────────
  const cancelSentRequest = async (toUserId: number) => {
    setError("");
    try {
      const headers: Record<string, string> = getAuthHeader();

      const res = await fetch(`/api/friends/${toUserId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to cancel request");
      }
      await fetchFriendsData();
    } catch (err: any) {
      console.error("Error cancelling sent request:", err);
      setError(err.message || "Error cancelling request");
    }
  };

  // ──────────────────────────────────────────────
  // 7) Accepter une demande reçue
  // ──────────────────────────────────────────────
  const acceptReceivedRequest = async (requestId: number) => {
    setError("");
    try {
      const headers: Record<string, string> = getAuthHeader();

      const res = await fetch(`/api/friends/request/${requestId}/accept`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        let data: any;
        try {
          data = await res.json();
        } catch {
          throw new Error("Failed to accept request");
        }
        throw new Error(data.message || "Failed to accept request");
      }
      await fetchFriendsData();
    } catch (err: any) {
      console.error("Error accepting received request:", err);
      setError(err.message || "Error accepting request");
    }
  };

  // ──────────────────────────────────────────────
  // 8) Refuser / supprimer une demande reçue
  // ──────────────────────────────────────────────
  const declineReceivedRequest = async (fromUserId: number) => {
    setError("");
    try {
      const headers: Record<string, string> = getAuthHeader();

      const res = await fetch(`/api/friends/${fromUserId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to decline request");
      }
      await fetchFriendsData();
    } catch (err: any) {
      console.error("Error declining received request:", err);
      setError(err.message || "Error declining request");
    }
  };

  // ──────────────────────────────────────────────
  // 9) Supprimer un ami existant
  // ──────────────────────────────────────────────
  const removeFriend = async (friendId: number) => {
    setError("");
    try {
      const headers: Record<string, string> = getAuthHeader();

      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to remove friend");
      }
      await fetchFriendsData();
    } catch (err: any) {
      console.error("Error removing friend:", err);
      setError(err.message || "Error removing friend");
    }
  };

  // ──────────────────────────────────────────────
  // 10) Rendu : on garde tous les headers dans le DOM,
  //     mais on masque / affiche via CSS (.hidden ou .open/.closed)
  // ──────────────────────────────────────────────
  return (
    <section className="friends-section">
      {/* ─────────── Add Friend (visible si aucune section ouverte) ─────────── */}
      {openSection === null && (
        <div className="section-add open">
          <div className="friend-input-row">
            <input
              type="text"
              placeholder="Add friend"
              value={newFriendPseudo}
              onChange={(e) => {
                setNewFriendPseudo(e.target.value);
                if (!e.target.value.trim()) {
                  setError("");
                }
              }}
              onKeyDown={handleKeyDown}
              className="friend-input"
            />
            <button
              className="send-button"
              onClick={sendFriendRequest}
              type="button"
              title="Send request"
            >
              <FaArrowRight />
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
      )}
      {/* Si openSection ≠ null, on empêche “Add friend” d’apparaître */}
      {openSection !== null && <div className="section-add closed" />}

      {/* ─────────── Sent Requests Header ─────────── */}
      <div
        className={`dropdown-header ${
          openSection === "sent" ? "expanded-header" : openSection !== null ? "hidden" : "standalone"
        }`}
        onClick={() => {
          setOpenSection(openSection === "sent" ? null : "sent");
          setError("");
        }}
      >
        <span className="dropdown-title">
          Sent Requests ({sentRequests.length})
        </span>
        <FaArrowDown className={`dropdown-icon ${openSection === "sent" ? "open" : ""}`} />
      </div>
      <div className={`section-content ${openSection === "sent" ? "open" : "closed"}`}>
        <ul className="dropdown-list">
          {sentRequests.length === 0 && (
            <li className="dropdown-item-empty">No sent requests</li>
          )}
          {sentRequests.map((req) => (
            <li key={req.id} className="dropdown-item">
              <div className="item-left">
                <img
                  src={req.to.avatarUrl || "/default-avatar.png"}
                  alt="Avatar"
                  className="item-avatar"
                />
                <span className="item-pseudo">{req.to.pseudo}</span>
              </div>
              <button
                className="item-action-button"
                onClick={() => cancelSentRequest(req.to.id)}
                type="button"
                title="Cancel request"
              >
                <FaTimes />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ─────────── Received Requests Header ─────────── */}
      <div
        className={`dropdown-header ${
          openSection === "received"
            ? "expanded-header"
            : openSection !== null
            ? "hidden"
            : "standalone"
        }`}
        onClick={() => {
          setOpenSection(openSection === "received" ? null : "received");
          setError("");
        }}
      >
        <span className="dropdown-title">
          Received Requests ({receivedRequests.length})
        </span>
        <FaArrowDown className={`dropdown-icon ${openSection === "received" ? "open" : ""}`} />
      </div>
      <div className={`section-content ${openSection === "received" ? "open" : "closed"}`}>
        <ul className="dropdown-list">
          {receivedRequests.length === 0 && (
            <li className="dropdown-item-empty">No received requests</li>
          )}
          {receivedRequests.map((req) => (
            <li key={req.id} className="dropdown-item">
              <div className="item-left">
                <img
                  src={req.from.avatarUrl || "/default-avatar.png"}
                  alt="Avatar"
                  className="item-avatar"
                />
                <span className="item-pseudo">{req.from.pseudo}</span>
              </div>
              <div className="item-actions-group">
                <button
                  className="item-accept-button"
                  onClick={() => acceptReceivedRequest(req.id)}
                  type="button"
                  title="Accept request"
                >
                  <FaCheck />
                </button>
                <button
                  className="item-decline-button"
                  onClick={() => declineReceivedRequest(req.from.id)}
                  type="button"
                  title="Decline request"
                >
                  <FaTimes />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ─────────── Friends List Header ─────────── */}
      <div
        className={`dropdown-header ${
          openSection === "friends"
            ? "expanded-header"
            : openSection !== null
            ? "hidden"
            : "standalone"
        }`}
        onClick={() => {
          setOpenSection(openSection === "friends" ? null : "friends");
          setError("");
        }}
      >
        <span className="dropdown-title">
          Friends ({friends.length})
        </span>
        <FaArrowDown className={`dropdown-icon ${openSection === "friends" ? "open" : ""}`} />
      </div>
      <div className={`section-content ${openSection === "friends" ? "open" : "closed"}`}>
        <ul className="dropdown-list">
          {friends.length === 0 && (
            <li className="dropdown-item-empty">No friends yet</li>
          )}
          {friends.map((friend) => (
            <li key={friend.id} className="dropdown-item">
              <div className="item-left">
                <img
                  src={friend.avatarUrl || "/default-avatar.png"}
                  alt="Avatar"
                  className="item-avatar"
                />
                <div className="item-text-group">
                  <span className="item-pseudo">{friend.pseudo}</span>
                  <span className="item-status">
                    {friend.status === "active" ? "online" : "offline"}
                  </span>
                </div>
              </div>
              <button
                className="item-remove-button"
                onClick={() => removeFriend(friend.id)}
                type="button"
                title="Remove friend"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
