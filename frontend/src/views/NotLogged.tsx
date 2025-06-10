import React from 'react';

const NotLogged: React.FC = () => (
    <div
        style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#0a174e',
        }}
    >
        <div
            style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '40px 32px',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                maxWidth: 400,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}
        >
            <h2 style={{ color: '#fff', marginBottom: 16, textAlign: 'center' }}>You are not logged in</h2>
            <p style={{ color: '#e0e0e0', marginBottom: 24, textAlign: 'center' }}>
                Please log in to access this page.
            </p>
            <a
                href="/login"
                style={{
                    display: 'inline-block',
                    background: '#2196f3',
                    color: '#fff',
                    padding: '10px 28px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'background 0.2s',
                    textAlign: 'center',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#1769aa')}
                onMouseOut={e => (e.currentTarget.style.background = '#2196f3')}
            >
                Go to login
            </a>
        </div>
    </div>
);

export default NotLogged;
