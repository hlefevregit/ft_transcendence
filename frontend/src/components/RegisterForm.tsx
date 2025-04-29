import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleRegister, googleLogin } from '@/services/authServices';
import '@/styles/style.css';


const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCreateAccount = async () => {
    try {
      const res = await handleRegister(name, email, password);
      if (res.success) {
        navigate('/login');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration.');
    }
  };

  return (
    <div className="font-[sans-serif] bg-gray-50 flex items-center md:h-screen p-4">
      <div className="w-full max-w-3xl max-md:max-w-xl mx-auto">
        <div className="bg-white grid md:grid-cols-2 gap-12 w-full sm:p-8 p-6 shadow-md rounded-md overflow-hidden">
          <div className="max-md:order-1 space-y-6">
            <div className="md:mb-16 mb-8">
              <h3 className="text-gray-800 text-xl">Instant Access</h3>
            </div>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {}}
                className="px-4 py-2.5 flex items-center justify-center rounded-md text-gray-800 text-sm tracking-wider border-none outline-none bg-white hover:bg-gray-200"
              >
                <img src="/assets/icons8-google.svg" width="22" className="mr-3" alt="Google logo" />
                Continue with Google
              </button>
            </div>
          </div>

          <form className="w-full">
            <div className="mb-8">
              <h3 className="text-gray-800 text-xl">Register</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-800 text-sm mb-2 block">Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter password"
                />
              </div>
              {/* <div className="flex items-center">
                <input
                  id="reg-remember-me"
                  name="reg-remember-me"
                  type="checkbox"
                  className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
                />
                <label htmlFor="remember-me" className="text-gray-800 ml-3 block text-sm">
                  I accept the <a href="#" className="text-blue-600 font-semibold hover:underline ml-1">Terms and Conditions</a>
                </label>
              </div>
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>} */}
            </div>

            <div className="!mt-8">
              <button
                type="button"
                onClick={handleCreateAccount}
                className="w-full py-2.5 px-4 text-sm tracking-wider rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none"
              >
                Create Account
              </button>
            </div>
            <p className="text-gray-800 text-sm mt-4 text-center">
              Already have an account?
              <Link to="/login" className="text-blue-600 font-semibold hover:underline ml-1">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
