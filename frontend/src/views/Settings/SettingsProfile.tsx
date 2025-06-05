// src/pages/SettingsProfile.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { FaPencilAlt } from "react-icons/fa";
import "@/styles/SettingsProfile.css";

type Tab = "profile" | "friends" | "history";

interface UserProfile {
  id: number;
  pseudo: string;
  avatarUrl?: string;
  status: "active" | "offline";
  twoFAEnabled: boolean;
}

export default function SettingsProfile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ──────────────────────────────────────────────────
  // State variables
  // ──────────────────────────────────────────────────
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // Base64 ou URL existant
  const [status, setStatus] = useState<"active" | "offline">("offline");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Inline editing pseudo
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const pseudoInputRef = useRef<HTMLInputElement | null>(null);

  // 2FA‐flow
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totp, setTotp] = useState("");

  const [error, setError] = useState<string>("");

  // ──────────────────────────────────────────────────
  // 1) On fetch l’utilisateur courant AU MONTAGE de ce composant
  // ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");

        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data: UserProfile = await res.json();

        setUser(data);
        setPseudo(data.pseudo);
        setAvatarUrl(data.avatarUrl || "");
        setStatus(data.status);
        setTwoFAEnabled(data.twoFAEnabled);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load profile.");
      }
    };

    fetchUser();
  }, []); // <= le tableau vide, donc uniquement AU PREMIER MONTAGE de ce composant!

  // ──────────────────────────────────────────────────
  // 2) Changer d’avatar → ouvrir le sélecteur & lire en Base64
  // ──────────────────────────────────────────────────
  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    fileInputRef.current?.click();
  };

  // ──────────────────────────────────────────────────
  // 3) Sauvegarder pseudo + avatar → PUT /api/user/me
  // ──────────────────────────────────────────────────
  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");

      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ pseudo, avatarUrl, status }), // status inclus
      });
      if (!res.ok) throw new Error("Update failed");

      const updatedUser: UserProfile = await res.json();
      setUser(updatedUser);
      setPseudo(updatedUser.pseudo);
      setAvatarUrl(updatedUser.avatarUrl || "");
      setStatus(updatedUser.status);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  // ──────────────────────────────────────────────────
  // 4) Basculer le statut → PUT /api/user/me
  // ──────────────────────────────────────────────────
  const toggleStatus = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (!user) return;
    const newStatus: "active" | "offline" = status === "active" ? "offline" : "active";
    setStatus(newStatus);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");

      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, pseudo, avatarUrl }),
      });
      if (!res.ok) throw new Error("Status update failed");
      const updatedUser: UserProfile = await res.json();
      setUser(updatedUser);
      setStatus(updatedUser.status);
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
      setStatus(user.status);
    }
  };

  // ──────────────────────────────────────────────────
  // 5) Gérer basculement 2FA
  // ──────────────────────────────────────────────────
  const handleToggle2FA = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setError("");

    if (!twoFAEnabled && !qrCodeUrl) {
      // Enable 2FA
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");

        const res = await fetch("/api/2fa/enable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to enable 2FA");
        setQrCodeUrl(data.qrCode);
      } catch (err: any) {
        console.error("Error enabling 2FA:", err);
        setError(err.message || "Error enabling 2FA");
      }
    } else if (!twoFAEnabled && qrCodeUrl) {
      // Masquer le QR si visible
      setQrCodeUrl(null);
    } else if (twoFAEnabled) {
      // Disable 2FA
      const confirmDisable = window.confirm("Are you sure you want to disable 2FA?");
      if (!confirmDisable) return;

      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");

        const res = await fetch("/api/2fa/disable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        });
        if (!res.ok) throw new Error("Disable failed");
        alert("2FA disabled!");
        // Recharger l’utilisateur pour mettre twoFAEnabled à jour
        const profileRes = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const updated: UserProfile = await profileRes.json();
        setTwoFAEnabled(updated.twoFAEnabled);
        setQrCodeUrl(null);
      } catch (err) {
        console.error(err);
        setError("Failed to disable 2FA.");
      }
    }
  };

  // ──────────────────────────────────────────────────
  // 6) Vérifier le TOTP (QR affiché)
  // ──────────────────────────────────────────────────
  const handleVerify2FA = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No token");

      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: totp }),
      });
      if (!res.ok) {
        alert("Invalid code");
        return;
      }
      alert("2FA enabled!");
      setQrCodeUrl(null);
      setTotp("");
      // Recharger l’utilisateur
      const profileRes = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const updated: UserProfile = await profileRes.json();
      setTwoFAEnabled(updated.twoFAEnabled);
    } catch (err) {
      console.error(err);
      setError("Failed to verify 2FA");
    }
  };

  // ──────────────────────────────────────────────────
  // 7) Inline‐edit pseudo : focus input en fin de texte
  // ──────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (isEditingPseudo && pseudoInputRef.current) {
      const len = pseudoInputRef.current.value.length;
      pseudoInputRef.current.setSelectionRange(len, len);
      pseudoInputRef.current.focus();
    }
  }, [isEditingPseudo]);

  const handlePseudoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (pseudo.trim() === "" && user) {
        setPseudo(user.pseudo);
      }
      setIsEditingPseudo(false);
    }
  };

  const handlePseudoBlur = () => {
    if (pseudo.trim() === "" && user) {
      setPseudo(user.pseudo);
    }
    setIsEditingPseudo(false);
  };

  return (
    <section className="profile-section">
      {/* 1) Avatar + Status (cliquable) + Pseudo (editable) + Crayon */}
      <div className="profile-row">
        <div className="avatar-wrapper">
          <img src={avatarUrl} alt="Avatar" className="avatar-image" />
          <button
            className={`status-dot status-${status === "active" ? "online" : "offline"}`}
            onClick={toggleStatus}
            type="button"
            onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
          />
        </div>

        <div className="pseudo-area">
          {isEditingPseudo ? (
            <input
              ref={pseudoInputRef}
              className="pseudo-input"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              onKeyDown={handlePseudoKeyDown}
              onBlur={handlePseudoBlur}
            />
          ) : (
            <button
              className="pseudo-text editable"
              onClick={() => setIsEditingPseudo(true)}
              type="button"
              onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
            >
              {pseudo || "Enter pseudo"}
            </button>
          )}
        </div>

        <FaPencilAlt className="pencil-icon" />
      </div>

      {/* 2) Change Avatar + Crayon */}
      <button
        className="profile-row clickable"
        onClick={triggerFileSelect}
        type="button"
        onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
      >
        <span className="row-text">Change Avatar</span>
        <FaPencilAlt className="pencil-icon" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarFileChange}
        style={{ display: "none" }}
      />

      {/* 3) Save */}
      <button
        className="save-button"
        onClick={handleSave}
        type="button"
        onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
      >
        Save
      </button>

      {/* 4) 2FA row : “2FA: Off” / “2FA: On” */}
      <button
        className={`profile-row clickable toggle-row ${
          twoFAEnabled ? "enabled" : "disabled"
        }`}
        onClick={handleToggle2FA}
        type="button"
        onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
      >
        <span className="row-text">
          2FA: {twoFAEnabled ? "On" : "Off"}
        </span>
        <div className="switch">
          <div className="slider" />
        </div>
      </button>

      {/* 4a) QR Section (toggle open/close) */}
      {qrCodeUrl && (
        <div className="qr-section">
          <p className="qr-instruction">
            Scan this QR code in your authentication app:
          </p>
          <img src={qrCodeUrl} alt="QR Code 2FA" className="qr-image" />
          <label htmlFor="totp" className="qr-label">
            2FA Code
          </label>
          <input
            id="totp"
            type="text"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            placeholder="123456"
            className="qr-input"
          />
          <button
            className="verify-button"
            onClick={handleVerify2FA}
            type="button"
            onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
          >
            Verify
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
