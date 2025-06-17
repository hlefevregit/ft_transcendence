import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleEmailLogin, googleLogin } from '../services/authServices';
import '../styles/style.css';
import { handle2FALogin } from '../services/authServices'; 


const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // 👈 état pour 2FA
  const googleClientRef = useRef<any>(null); // 👈 stocke l'instance du client
  const [otp, setOtp] = useState('');


  const handle2FACheck = async () => {
    try {
      const userId = localStorage.getItem('pendingUserId');
      if (!userId) {
        setError('User ID not found for 2FA verification.');
        return;
      }
      const response = await handle2FALogin(otp);
      console.log("✅ 2FA backend response", response);
      if (response.success) {
        console.log("✅ 2FA SUCCESS");
        localStorage.setItem('authToken', response.token);
        localStorage.removeItem('pendingUserId');
        const user = response.user;
        console.log("✅ User data:", user);
        // localStorage.setItem('userId', user.id);
        // localStorage.setItem('pseudo', user.pseudo || ''); // stocke le nom d'utilisateur
        navigate('/game1');
      } else {
        console.error("❌ 2FA failed:", response.message);
        setError('Invalid 2FA code');
      }
    } catch {
      setError('2FA verification failed.');
    }
  };


  const handleLogin = async () => {
    
    try {
      const res = await handleEmailLogin(email, password);
      console.log("2FA?", res.user?.twoFAEnabled);
      console.log("Login response:", res);
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        if (res.user.twoFAEnabled) {
          setIs2FAEnabled(true);
          localStorage.setItem('pendingUserId', res.user.id); // ou res.userId
          setError('2FA enabled, please enter your code.');
          return;
        }
        const user = res.user;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('pseudo', user.pseudo || ''); // stocke le nom d'utilisateur
        navigate('/game1'); // si 2FA non activé

      } else {
         setError(res.message || 'Invalid credentials');
       }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  }

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const res = await googleLogin(idToken);
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        const user = res.user;
        // localStorage.setItem('pseudo', user.pseudo || ''); // stocke le nom d'utilisateur
        // localStorage.setItem('userId', user.id); // ou un string unique
        navigate('/game1');
      } else {
        setError(res.message || 'Google login failed');
      }
    } catch {
      setError('Google login error.');
    }
  };
  useEffect(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: '930883947615-3ful7pfe6k38qbdqfph7ja2lp76spahf.apps.googleusercontent.com',
        callback: (response: any) => {
          handleGoogleLogin(response.credential);
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-login-btn'),
        { theme: 'outline', size: 'large' }
      );
    }
  }, []);

  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl max-md:max-w-md w-full">
          <div>
            <h2 className="lg:text-5xl text-3xl font-extrabold lg:leading-[55px] text-white">
              Seamless Login for Exclusive Access
            </h2>
            <p className="text-sm mt-6 text-white">
              Immerse yourself in a hassle-free login journey with our intuitively designed login form.
            </p>
            <p className="text-sm mt-12 text-white">
              Don't have an account 
              <Link to="/register" className="text-blue-600 font-semibold hover:underline ml-1">
                Register here
              </Link>
            </p>
          </div>

          <form className="max-w-md md:ml-auto w-full">
            <h3 className="text-white text-3xl font-extrabold mb-8">Sign in</h3>

            <div className="space-y-4">
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white w-full text-sm px-4 py-3.5 rounded-md outline-blue-600"
                placeholder="Email address"
              />
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white w-full text-sm px-4 py-3.5 rounded-md outline-blue-60"
                placeholder="Password"
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center text-sm text-white">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-semibold">
                  Forgot your password?
                </a>
              </div>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleLogin}
                className="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                Log in
              </button>
            </div>
            {is2FAEnabled && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter 2FA code"
                  className="bg-white w-full text-sm px-4 py-3.5 rounded-md outline-blue-600"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  onClick={handle2FACheck}
                  className="w-full mt-2 shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-white bg-green-600 hover:bg-green-700"
                >
                  Verify 2FA
                </button>
              </div>
            )}

            <div className="my-4 flex items-center gap-4">
              <hr className="w-full border-gray-300" />
              <p className="text-sm text-white text-center">or</p>
              <hr className="w-full border-gray-300" />
            </div>

            <div className="flex justify-center mt-6">
              <div id="google-login-btn"></div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
