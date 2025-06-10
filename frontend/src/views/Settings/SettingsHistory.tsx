// src/components/SettingsHistory.tsx
import React, { useState, useEffect } from "react";
import "@/styles/SettingsHistory.css";

interface Match {
  id: string;
  user: { pseudo: string; avatarUrl?: string };
  opponent: { pseudo: string; avatarUrl?: string };
  userScore: number;
  opponentScore: number;
  result: "win" | "loss" | "draw";
  date: string;
  reason: string;
}

interface Stats {
  wins: number;
  losses: number;
  trophies: number;
}

export default function SettingsHistory() {
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, trophies: 0 });
  const [matches, setMatches] = useState<Match[]>([]);

  // JWT header helper
  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetch("/api/user/history", {
      credentials: "include",
      headers: getAuthHeader()
    })
      .then((res) => res.json())
      .then(({ stats, matches }) => {
        setStats(stats);
        setMatches(matches);
      })
      .catch(console.error);
  }, []);

  // active le scroll si plus de 5 matchs
  const isScrollable = matches.length > 5;

  return (
    <section className="history-section">
      {/* ─── Statistiques ─── */}
      <div className="history-stats">
        <div className="stat-card win-card">
          <span className="stat-value">{stats.wins}</span>
          <span className="stat-label">Wins</span>
        </div>
        <div className="stat-card loss-card">
          <span className="stat-value">{stats.losses}</span>
          <span className="stat-label">Losses</span>
        </div>
        <div className="stat-card trophy-card">
          <span className="stat-value">{stats.trophies}</span>
          <span className="stat-label">Trophées</span>
        </div>
      </div>

      {/* ─── Liste des matchs ─── */}
      <div className={`matches-list${isScrollable ? " scrollable" : ""}`}>
        {matches.map((m) => (
          <div key={m.id} className={`match-card ${m.result}`}>
            <div className="player player--left">
              <img
                src={m.user.avatarUrl || "/default-avatar.png"}
                alt=""
                className="avatar"
              />
              <span className="pseudo">{m.user.pseudo}</span>
            </div>
            <div className="score-container">
              <span className="reason">{m.reason}</span>
              <div className="score">
                <span className="you">{m.userScore}</span>
                <span className="dash">–</span>
                <span className="opp">{m.opponentScore}</span>
              </div>
              <span className="date">{m.date}</span>
            </div>
            <div className="player player--right">
              <span className="pseudo">{m.opponent.pseudo}</span>
              <img
                src={m.opponent.avatarUrl || "/default-avatar.png"}
                alt=""
                className="avatar"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
