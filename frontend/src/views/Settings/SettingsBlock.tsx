// SettingsBlock.tsx
import React, { useState, useEffect } from "react";
import "@/styles/SettingsBlock.css";
import { useTranslation } from 'react-i18next';

interface BlockedUser {
  id: number;
  pseudo: string;
  avatarUrl?: string;
}

export default function SettingsBlock() {
  const { t } = useTranslation();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch("/api/me/blocked", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error loading blocked users");
        const { blockedUsers }: { blockedUsers: BlockedUser[] } = await res.json();
        setBlockedUsers(blockedUsers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUnblock = async (id: number) => {
    // Optimistic UI
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/users/${id}/unblock`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unblock failed");
    } catch {
      setError("Unable to unblock. Please try again.");
    }
  };

  if (loading) return <div className="sb-loading">Loading…</div>;
  if (error)   return <div className="sb-error">{error}</div>;
  if (blockedUsers.length === 0) {
    return <div className="sb-empty">{t('no_blocked_users')}</div>;
  }

  return (
    <div className="sb-container">
      <h2 className="sb-title">{t('blocked_users')}</h2>
      <ul className="sb-list">
        {blockedUsers.map(({ id, pseudo, avatarUrl }) => (
          <li key={id} className="sb-item">
            <img
              src={avatarUrl || "/assets/default-avatar.png"}
              alt={pseudo}
              className="sb-avatar"
            />
            <span className="sb-pseudo">{pseudo}</span>
            <button
              onClick={() => handleUnblock(id)}
              className="sb-unblock-btn"
            >
			  {t('unblock')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
