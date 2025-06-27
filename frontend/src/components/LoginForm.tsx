import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleEmailLogin, googleLogin, handle2FALogin } from '../services/authServices';
import '@/styles/style.css';
import { GOOGLE_CLIENT_ID } from '../../env/env';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otp, setOtp] = useState('');

  // Handle email/password login
  const handleLogin = async () => {
    setError('');
    const trimmedEmail = email.trim();
    // Security: block deleted_ accounts
    if (trimmedEmail.startsWith('deleted_')) {
      setError('Email non autorisé');
      return;
    }
    try {
      const res = await handleEmailLogin(trimmedEmail, password);
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        if (res.user.twoFAEnabled) {
          setIs2FAEnabled(true);
          localStorage.setItem('pendingUserId', String(res.user.id));
          setError('2FA enabled, please enter your code.');
          return;
        }
        navigate('/game1');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    }
  };

  // Handle 2FA verification
  const handle2FACheck = async () => {
    setError('');
    try {
      const response = await handle2FALogin(otp);
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.removeItem('pendingUserId');
        navigate('/game1');
      } else {
        setError('Invalid 2FA code');
      }
    } catch {
      setError('2FA verification failed.');
    }
  };

  // Handle Google login
  const handleGoogle = async (idToken: string) => {
    setError('');
    try {
      const res = await googleLogin(idToken);
      if (res.success) {
        // Security: block deleted_ accounts
        if (res.user.email.startsWith('deleted_')) {
          setError('Email non autorisé');
          return;
        }
        localStorage.setItem('authToken', res.token);
        const user = res.user;
        // localStorage.setItem('pseudo', user.pseudo || ''); // stocke le nom d'utilisateur
        // localStorage.setItem('userId', user.id); // ou un string unique
        if (res.user.twoFAEnabled) {
          setIs2FAEnabled(true);
          localStorage.setItem('pendingUserId', String(res.user.id));
          setError('2FA enabled, please enter your code.');
          return;
        }
        navigate('/game1');
      } else {
        setError(res.message || 'Google login failed');
      }
    } catch {
      setError('Google login error.');
    }
  };

  // Load Google script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?hl=en';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (window.google?.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => handleGoogle(response.credential),
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-login-btn') as HTMLElement,
          { theme: 'outline', size: 'large' } as any
        );
      }
    };
  }, []);

  return (
    <div className="font-[sans-serif] bg-gray-50 flex items-center md:h-screen p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white grid md:grid-cols-1 gap-12 w-full sm:p-8 p-6 shadow-md rounded-md overflow-hidden">
          <form className="w-full">
            <h3 className="text-gray-800 text-xl mb-4 text-center">Sign In</h3>
            {/* General error */}
            {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleLogin}
                disabled={is2FAEnabled}
                className="w-full py-2.5 px-4 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none disabled:opacity-50"
              >
                Log In
              </button>
            </div>

            {/* 2FA input and verify button */}
            {is2FAEnabled && (
              <>
                <div className="mt-4">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 2FA code"
                    className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                  />
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handle2FACheck}
                    className="w-full py-2.5 px-4 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white focus:outline-none"
                  >
                    Verify 2FA
                  </button>
                </div>
              </>
            )}

            <div className="my-4 flex items-center gap-4">
              <hr className="w-full border-gray-300" />
              <p className="text-gray-800 text-sm text-center">or</p>
              <hr className="w-full border-gray-300" />
            </div>

            <div className="flex justify-center mt-6">
              <div id="google-login-btn"></div>
            </div>

            <p className="text-gray-800 text-sm mt-6 text-center">
              Don't have an account?
              <Link to="/register" className="text-blue-600 font-semibold hover:underline ml-1">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
