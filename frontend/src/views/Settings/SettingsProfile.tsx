import React, {
	useState,
	useEffect,
	useRef,
	useLayoutEffect,
} from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import steveImg from '@/assets/steve.jpg';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import '@/styles/SettingsProfile.css';
import { fileTypeFromBuffer } from 'file-type';


import { useTranslation } from 'react-i18next';

interface UserProfile {
	id: number;
	pseudo: string;
	avatarUrl?: string;
	status: 'active' | 'offline';
	twoFAEnabled: boolean;
}

export default function SettingsProfile() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

	const [user, setUser] = useState<UserProfile | null>(null);
	const [pseudo, setPseudo] = useState('');
	const [avatarUrl, setAvatarUrl] = useState<string>('');
	const [status, setStatus] = useState<'active' | 'offline'>('offline');
	const [twoFAEnabled, setTwoFAEnabled] = useState(false);

	const [isEditingPseudo, setIsEditingPseudo] = useState(false);
	const pseudoInputRef = useRef<HTMLInputElement>(null);

	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
	const [totp, setTotp] = useState('');
	const [error, setError] = useState('');

	const [initial, setInitial] = useState<{
		pseudo: string;
		avatarUrl: string;
		status: 'active' | 'offline';
	} | null>(null);

	const [dialog, setDialog] = useState<{
		message: string;
		onConfirm: () => void;
	} | null>(null);

	const defaultAvatar = steveImg;

  // Fetch user
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
        const av = data.avatarUrl || defaultAvatar;
        setAvatarUrl(av);
        setStatus(data.status);
        setTwoFAEnabled(data.twoFAEnabled);
        setInitial({ pseudo: data.pseudo, avatarUrl: av, status: data.status });
      } catch {
        setError(t('profile_fetch_error'));
      }
    })();
  }, []);

  // Avatar → Base64
  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError(t('invalid_image_format_error'));
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };
  const triggerFileSelect = () => fileInputRef.current?.click();

	// Avatar → Base64
	const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// lecture du buffer
		const arrayBuffer = await file.arrayBuffer();
		const ft = await fileTypeFromBuffer(new Uint8Array(arrayBuffer));

		if (!ft || !['image/jpeg', 'image/png'].includes(ft.mime)) {
			setError('File must be a valid JPG, JPEG, or PNG image.');
			return;
		}

		// OK, on peut générer le preview
		const reader = new FileReader();
		reader.onloadend = () => setAvatarUrl(reader.result as string);
		reader.readAsDataURL(file);
	};
	const triggerFileSelect = () => fileInputRef.current?.click();

	const isDirty =
		initial != null &&
		(pseudo !== initial.pseudo ||
			avatarUrl !== initial.avatarUrl ||
			status !== initial.status);

	const handleReset = () => {
		if (!initial) return;
		setPseudo(initial.pseudo);
		setAvatarUrl(initial.avatarUrl);
		setStatus(initial.status);
		setError('');
	};
  // Save
  const handleSave = async () => {
    setError('');
    if (pseudo.length > 16) {
      setError(t('username_format_error'));
      return;
    }
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
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      const updated: UserProfile = await res.json();
      setUser(updated);
      setPseudo(updated.pseudo);
      const av = updated.avatarUrl || defaultAvatar;
      setAvatarUrl(av);
      setStatus(updated.status);
      setInitial({ pseudo: updated.pseudo, avatarUrl: av, status: updated.status });
    } catch (err: any) {
      setError(err.message || t('profile_fetch_error'));
    }
  };

  // Status toggle
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
      setInitial(i => i && ({ ...i, status: next }));
    } catch {
      setStatus(user.status);
      setError(t('status_update_error'));
    }
  };

  // 2FA toggle
  const handleToggle2FA = async () => {
    setError('');
    if (!twoFAEnabled && !qrCodeUrl) {
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
        if (!res.ok) throw new Error(data.error || t('2fa_enable_error'));
        setQrCodeUrl(data.qrCode);
      } catch (err: any) {
        setError(err.message || t('2fa_enable_error'));
      }
    } else if (!twoFAEnabled && qrCodeUrl) {
      setQrCodeUrl(null);
    } else {
      setDialog({
        message: t('disable_2fa_confirmation'),
        onConfirm: async () => {
          setDialog(null);
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
            if (!res.ok) throw new Error(t('2fa_disable_error'));
            const pr = await fetch('/api/me', {
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include',
            });
            const upd: UserProfile = await pr.json();
            setTwoFAEnabled(upd.twoFAEnabled);
            setQrCodeUrl(null);
          } catch {
            setError(t('2fa_disable_error'));
          }
        },
      });
    }
  };

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
        setError(t('2fa_error'));
        return;
      }
      setQrCodeUrl(null);
      setTotp('');
      const pr = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const upd: UserProfile = await pr.json();
      setTwoFAEnabled(upd.twoFAEnabled);
    } catch {
      setError(t('2fa_failed_error'));
    }
  };

	// Save
	const handleSave = async () => {
		setError('');
		if (pseudo.length > 16) {
			setError('Username too long');
			return;
		}
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
			if (!res.ok) {
				const { message } = await res.json();
				throw new Error(message);
			}
			const updated: UserProfile = await res.json();
			setUser(updated);
			setPseudo(updated.pseudo);
			const av = updated.avatarUrl || defaultAvatar;
			setAvatarUrl(av);
			setStatus(updated.status);
			setInitial({ pseudo: updated.pseudo, avatarUrl: av, status: updated.status });
		} catch (err: any) {
			setError(err.message || 'Failed to update profile.');
		}
	};

	// Status toggle
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
			setInitial(i => i && ({ ...i, status: next }));
		} catch {
			setStatus(user.status);
			setError('Failed to update status.');
		}
	};

	// 2FA toggle
	const handleToggle2FA = async () => {
		setError('');
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
			if (!res.ok) throw new Error(data.error || 'Enable 2FA failed');
			setQrCodeUrl(data.qrCode);
		} catch (err: any) {
			setError(err.message || 'Error enabling 2FA');
		}
	};
  // Logout & Delete account
  const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };
  const deleteAccount = () => {
    setDialog({
      message: t('delete_account_confirmation'),
      onConfirm: async () => {
        setDialog(null);
        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error();
          const res = await fetch('/api/user/me', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          if (!res.ok) throw new Error();
          window.location.href = '/';
        } catch {
          setError(t('delete_account_error'));
        }
      },
    });
  };

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
				setError('Invalid 2FA code.');
				return;
			}
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

	// Inline-edit pseudo
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

	// Logout
	const logout = () => {
		localStorage.removeItem('authToken');
		window.location.href = '/';
	};

	return (
		<section className="profile-section">
			{dialog && (
				<ConfirmationDialog
					message={dialog.message}
					onConfirm={dialog.onConfirm}
					onCancel={() => setDialog(null)}
				/>
			)}
      {/* Avatar + Change + Save/Reset */}
      <div className="profile-block">
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
                className={`pseudo-input ${pseudo.length > 16 ? 'error' : ''}`}
                value={pseudo}
                maxLength={16}
                onChange={e => setPseudo(e.target.value)}
                onKeyDown={handlePseudoKey}
                onBlur={handlePseudoBlur}
              />
            ) : (
              <button
                className="pseudo-text editable"
                onClick={() => setIsEditingPseudo(true)}
                type="button"
              >
				{ pseudo || t('username_placeholder')}
              </button>
            )}
          </div>
          <FaPencilAlt className="pencil-icon" />
        </div>

        <div className="avatar-actions">
          <button
            title="jpg, jpeg, png"
            className="change-avatar-btn"
            onClick={triggerFileSelect}
            type="button"
          >
			{t('change_avatar_button')}
          </button>
          <button
            className="delete-avatar-btn"
            onClick={() => setAvatarUrl(defaultAvatar)}
            type="button"
          >
			{t('delete_avatar_button')}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={onAvatarFileChange}
          style={{ display: 'none' }}
        />

        <div className="save-reset-container">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!isDirty}
            type="button"
          >
			{t('save_button')}
          </button>
          <button
            className="reset-button"
            onClick={handleReset}
            disabled={!isDirty}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2FA block */}
      <div className="twofa-block">
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
        {qrCodeUrl && (
          <div className="qr-section">
            <p className="qr-instruction">
			  {t('scan_qr_code_instruction')}
            </p>
            <img src={qrCodeUrl} alt="QR Code 2FA" className="qr-image" />
            <div className="qr-input-group">
              <input
                className="qr-input"
                placeholder={t('2fa_placeholder')}
                value={totp}
                onChange={e => setTotp(e.target.value)}
              />
              <button
                className="verify-button"
                onClick={handleVerify2FA}
                type="button"
              >
				{t('verify_2fa_settings_button')}
              </button>
            </div>
          </div>
        )}
      </div>

			{/* Avatar + Change + Save/Reset */}
			<div className="profile-block">
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
								className={`pseudo-input ${pseudo.length > 16 ? 'error' : ''}`}
								value={pseudo}
								maxLength={16}
								onChange={e => setPseudo(e.target.value)}
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

				<div className="avatar-actions">
					<button
						title="jpg, jpeg, png"
						className="change-avatar-btn"
						onClick={triggerFileSelect}
						type="button"
					>
						Change Avatar
					</button>
					<button
						className="delete-avatar-btn"
						onClick={() => setAvatarUrl(defaultAvatar)}
						type="button"
					>
						Delete Avatar
					</button>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept=".jpg,.jpeg,.png"
					onChange={onAvatarFileChange}
					style={{ display: 'none' }}
				/>

				<div className="save-reset-container">
					<button
						className="save-button"
						onClick={handleSave}
						disabled={!isDirty}
						type="button"
					>
						Save
					</button>
					<button
						className="reset-button"
						onClick={handleReset}
						disabled={!isDirty}
						type="button"
					>
						✕
					</button>
				</div>
			</div>

			{/* 2FA block */}
			<div className="twofa-block">
				<button
					className={`profile-row clickable toggle-row ${twoFAEnabled ? 'enabled' : 'disabled'
						}`}
					onClick={handleToggle2FA}
					type="button"
				>
					<span className="row-text">2FA: {twoFAEnabled ? 'On' : 'Off'}</span>
					<div className="switch">
						<div className="slider" />
					</div>
				</button>
				{true && (
					<div className="qr-section">
						<p className="qr-instruction">
							Scan this QR code with your authentication app:
						</p>
						<img src={qrCodeUrl} alt="QR Code 2FA" className="qr-image" />
						<div className="qr-input-group">
							<input
								className="qr-input"
								placeholder="Enter 2FA code"
								value={totp}
								onChange={e => setTotp(e.target.value)}
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
			</div>

			{error && <p className="error-text">{error}</p>}

			{/* Logout & Delete Account */}
			<div className="extra-actions">
				<button className="logout-button clickable" onClick={logout} type="button">
					Logout
				</button>
			</div>
		</section>
	);
      {/* Logout & Delete Account */}
      <div className="extra-actions">
        <button className="logout-button clickable" onClick={logout} type="button">
		  {t('logout_button')}
        </button>
        <button
          className="delete-data-button clickable"
          onClick={deleteAccount}
          type="button"
        >
		  {t('delete_account_button')}
        </button>
      </div>
    </section>
  );
}
