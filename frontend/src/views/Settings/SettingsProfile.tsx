// src/views/Settings/SettingsProfile.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import steveImg from '@/assets/steve.jpg';
import '@/styles/SettingsProfile.css';

interface UserProfile {
  id: number;
  pseudo: string;
  avatarUrl?: string;
  status: 'active' | 'offline';
  twoFAEnabled: boolean;
}

export default function SettingsProfile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [pseudo, setPseudo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'offline'>('offline');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const pseudoInputRef = useRef<HTMLInputElement | null>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totp, setTotp] = useState('');
  const [error, setError] = useState('');

  // Steve’s avatar as default/reset
  const defaultAvatar = steveImg;

  // ──────────────────────────────────────────────────
  // Fetch current user on mount
  // ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error();
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!res.ok) throw new Error();
        const data: UserProfile = await res.json();
        setUser(data);
        setPseudo(data.pseudo);
        setAvatarUrl(data.avatarUrl || defaultAvatar);
        setStatus(data.status);
        setTwoFAEnabled(data.twoFAEnabled);
      } catch {
        setError('Unable to load profile.');
      }
    })();
  }, []);

  // ──────────────────────────────────────────────────
  // Avatar file → Base64
  // ──────────────────────────────────────────────────
  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };
  const triggerFileSelect = () => fileInputRef.current?.click();

  // ──────────────────────────────────────────────────
  // Save profile (pseudo, avatar, status)
  // ──────────────────────────────────────────────────
  const handleSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error();
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
      const updated: UserProfile = await res.json();
      setUser(updated);
      setPseudo(updated.pseudo);
      setAvatarUrl(updated.avatarUrl || defaultAvatar);
      setStatus(updated.status);
      alert('Profile updated!');
    } catch {
      setError('Failed to update profile.');
    }
  };

  // ──────────────────────────────────────────────────
  // Toggle status active/offline
  // ──────────────────────────────────────────────────
  const toggleStatus = async () => {
    if (!user) return;
    const next = status === 'active' ? 'offline' : 'active';
    setStatus(next);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error();
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: next, pseudo, avatarUrl }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setStatus(user.status);
      setError('Failed to update status.');
    }
  };

  // ──────────────────────────────────────────────────
  // 2FA: enable / disable
  // ──────────────────────────────────────────────────
  const handleToggle2FA = async () => {
    setError('');
    if (!twoFAEnabled && !qrCodeUrl) {
      // enable → fetch QR
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error();
        const res = await fetch('/api/2fa/enable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Enable failed');
        setQrCodeUrl(data.qrCode);
      } catch (err: any) {
        setError(err.message || 'Error enabling 2FA');
      }
    } else if (!twoFAEnabled && qrCodeUrl) {
      // hide QR
      setQrCodeUrl(null);
    } else {
      // disable
      if (!confirm('Disable 2FA?')) return;
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error();
        const res = await fetch('/api/2fa/disable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        });
        if (!res.ok) throw new Error('Disable failed');
        alert('2FA disabled!');
        const pr = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const upd: UserProfile = await pr.json();
        setTwoFAEnabled(upd.twoFAEnabled);
        setQrCodeUrl(null);
      } catch {
        setError('Failed to disable 2FA.');
      }
    }
  };

  // ──────────────────────────────────────────────────
  // Verify the TOTP code
  // ──────────────────────────────────────────────────
  const handleVerify2FA = async () => {
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error();
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: totp }),
      });
      if (!res.ok) {
        alert('Invalid code');
        return;
      }
      alert('2FA enabled!');
      setQrCodeUrl(null);
      setTotp('');
      const pr = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const upd: UserProfile = await pr.json();
      setTwoFAEnabled(upd.twoFAEnabled);
    } catch {
      setError('Failed to verify 2FA');
    }
  };

  // ──────────────────────────────────────────────────
  // Inline‐edit username
  // ──────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (isEditingPseudo && pseudoInputRef.current) {
      const len = pseudoInputRef.current.value.length;
      pseudoInputRef.current.setSelectionRange(len, len);
      pseudoInputRef.current.focus();
    }
  }, [isEditingPseudo]);

  const handlePseudoKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!pseudo.trim() && user) setPseudo(user.pseudo);
      setIsEditingPseudo(false);
    }
  };
  const handlePseudoBlur = () => {
    if (!pseudo.trim() && user) setPseudo(user.pseudo);
    setIsEditingPseudo(false);
  };

  // ──────────────────────────────────────────────────
  // Logout & Delete all data
  // ──────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };
  const deleteAll = async () => {
    if (!confirm('Delete ALL your data?')) return;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error();
      const res = await fetch('/api/user/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      alert('Data deleted.');
      window.location.href = '/';
    } catch {
      setError('Failed to delete data.');
    }
  };

  // ──────────────────────────────────────────────────
  // Reset avatar to default
  // ──────────────────────────────────────────────────
  const resetAvatar = () => {
    if (!confirm('Reset to Steve’s avatar?')) return;
    setAvatarUrl(defaultAvatar);
  };

  return (
    <section className="profile-section">
      {/* 1) Avatar + Status + Username */}
      <div className="profile-row">
        <div className="avatar-wrapper">
          <img src={avatarUrl} alt="Avatar" className="avatar-image" />
          <button
            className={`status-dot status-${status}`}
            onClick={toggleStatus}
            type="button"
          />
        </div>
        <div className="pseudo-area">
          {isEditingPseudo ? (
            <input
              ref={pseudoInputRef}
              className="pseudo-input"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              onKeyDown={handlePseudoKey}
              onBlur={handlePseudoBlur}
            />
          ) : (
            <button
              className="pseudo-text editable"
              onClick={() => setIsEditingPseudo(true)}
              type="button"
            >
              {pseudo || 'Enter username'}
            </button>
          )}
        </div>
        <FaPencilAlt className="pencil-icon" />
      </div>

      {/* 2) Change / Delete Avatar (two standalone buttons) */}
      <div className="extra-actions avatar-actions">
        <button
          className="logout-button clickable"
          onClick={triggerFileSelect}
          type="button"
        >
          Change Avatar
        </button>
        <button
          className="delete-data-button clickable"
          onClick={resetAvatar}
          type="button"
        >
          Delete Avatar
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarFileChange}
        style={{ display: 'none' }}
      />

      {/* 3) Save */}
      <button className="save-button" onClick={handleSave} type="button">
        Save
      </button>

      {/* 4) 2FA toggle */}
      <button
        className={`profile-row clickable toggle-row ${
          twoFAEnabled ? 'enabled' : 'disabled'
        }`}
        onClick={handleToggle2FA}
        type="button"
      >
        <span className="row-text">2FA: {twoFAEnabled ? 'On' : 'Off'}</span>
        <div className="switch">
          <div className="slider" />
        </div>
      </button>

      {/* 4a) QR + inline input + verify */}
      {qrCodeUrl && (
        <div className="qr-section">
          <p className="qr-instruction">
            Scan this QR code in your authentication app:
          </p>
          <img src={qrCodeUrl} alt="QR Code 2FA" className="qr-image" />
          <div className="qr-input-group">
            <input
              className="qr-input"
              placeholder="2FA Code"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
            />
            <button
              className="verify-button"
              onClick={handleVerify2FA}
              type="button"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {/* 5) Logout & Delete My Account */}
      <div className="extra-actions">
        <button className="logout-button clickable" onClick={logout} type="button">
          Logout
        </button>
        <button
          className="delete-data-button clickable"
          onClick={deleteAll}
          type="button"
        >
          Delete My Account
        </button>
      </div>
    </section>
  );
}
