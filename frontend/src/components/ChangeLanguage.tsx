import { useState } from 'react';
import i18n from '../i18n';

export default function LanguageSwitcher() {
	const [open, setOpen] = useState(false);

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		setOpen(false);
	};

	return (
		<div style={{
			position: 'fixed',
			top: '1rem',
			right: '1rem',
			zIndex: 1000
		}}>
			<button
				onClick={() => setOpen(!open)}
				style={{
					padding: '0.5rem 1rem',
					backgroundColor: '#eee',
					border: '1px solid #ccc',
					borderRadius: '4px',
					cursor: 'pointer'
				}}
			>
				🌐
			</button>

			{open && (
				<div style={{
					marginTop: '0.5rem',
					display: 'flex',
					flexDirection: 'column',
					gap: '0.25rem',
					backgroundColor: '#fff',
					border: '1px solid #ccc',
					padding: '0.5rem',
					borderRadius: '4px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
				}}>
					<button
						onClick={() => changeLanguage('en')}
						style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
					>
						🇬🇧
					</button>
					<button
						onClick={() => changeLanguage('fr')}
						style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
					>
						🇫🇷
					</button>
					<button
						onClick={() => changeLanguage('it')}
						style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
					>
						🇮🇹
					</button>
				</div>
			)}
		</div>
	);
}
