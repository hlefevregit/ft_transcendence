import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleRegister, googleLogin } from '@/services/authServices';
import '@/styles/style.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/ChangeLanguage';


const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ pseudo?: string; email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

    const validate = () => {
    const newErrors: { pseudo?: string; email?: string; password?: string } = {};
    if (!/^[A-Za-z0-9_]{1,16}$/.test(pseudo.trim())) {
      newErrors.pseudo = 'Pseudo must be 1 to 16 characters (letters, numbers, underscore).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Invalid email format.';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}/.test(password)) {
      newErrors.password =
        'Password must have at least 8 characters, including one uppercase, one lowercase, one number, and one special character.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleCreateAccount = async () => {
    // réinitialise les erreurs globales avant tentative
    setErrors(e => ({ ...e, general: undefined }));
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await handleRegister(pseudo.trim(), email.trim(), password);
      if (res.success) {
        // save token and go directly to game1
        localStorage.setItem('authToken', res.token);
        navigate('/game1');
      } else {
        // mapper le message renvoyé sur le bon champ
        const msg = res.message || 'Registration failed.';
        const fieldErrors: typeof errors = {};
        if (/email/i.test(msg)) fieldErrors.email = msg;
        else if (/pseudo/i.test(msg)) fieldErrors.pseudo = msg;
        else if (/password/i.test(msg)) fieldErrors.password = msg;
        else fieldErrors.general = msg;
        setErrors(fieldErrors);
      }
    } catch {
      setErrors({ general: 'An error occurred during registration.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    // réinitialise les erreurs globales avant tentative Google
    setErrors(e => ({ ...e, general: undefined }));
    try {
      const res = await googleLogin(idToken);
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        navigate('/game1');
      } else {
        setErrors(e => ({ ...e, general: res.message || t('google_auth_error') }));
      }
    } catch (err) {
      // console.error('Google login error:', err);
      setErrors(e => ({ ...e, general: t('google_auth_error') }));
    }
  };
    useEffect(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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



  // return (
  //   <div className="font-[sans-serif] bg-gray-50 flex items-center md:h-screen p-4">
	//   <LanguageSwitcher />
  //     <div className="w-full max-w-3xl max-md:max-w-xl mx-auto">
  //       <div className="bg-white grid md:grid-cols-2 gap-12 w-full sm:p-8 p-6 shadow-md rounded-md overflow-hidden">
  //         <div className="max-md:order-1 space-y-6">
  //           <div className="md:mb-16 mb-8">
  //             <h3 className="text-gray-800 text-xl">Instant Access</h3>
  //           </div>
  //           <div className="space-y-4">
  //             <div id="google-login-btn"></div>
  //           </div>
  //         </div>

  //         <form className="w-full">
  //           <h3 className="text-gray-800 text-xl mb-4">{t('register')}</h3>
  //           {/* Affichage de l’erreur "générale" */}
  //           {errors.general && (
  //             <p className="text-red-600 text-sm mb-4">
  //               {errors.general}
  //             </p>
  //           )}
  //           <div className="space-y-4">
  //             <div>
  //               <label htmlFor="reg-pseudo" className="text-gray-800 text-sm mb-2 block">
	// 			  {t('username')}
  //               </label>
  //               <input
  //                 id="reg-name"
  //                 type="text"
  //                 value={pseudo}
  //                 onChange={(e) => setPseudo(e.target.value)}
  //                 required
  //                 placeholder={t('username_placeholder')}
  //                 className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
  //               />
  //             </div>
  //             <div>
  //               <label htmlFor="reg-email" className="text-gray-800 text-sm mb-2 block">
	// 			  {t('email')}
  //               </label>
  //               <input
  //                 id="reg-email"
  //                 type="email"
  //                 value={email}
  //                 onChange={(e) => setEmail(e.target.value)}
  //                 required
  //                 placeholder={t('email_placeholder')}
  //                 className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
  //               />
  //             </div>
  //             <div>
  //               <label htmlFor="reg-password" className="text-gray-800 text-sm mb-2 block">
	// 			  {t('password')}
  //               </label>
  //               <input
  //                 id="reg-password"
  //                 type="password"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //                 required
  //                 placeholder={t('password_placeholder')}
  //                 className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
  //               />
  //             </div> 
  //             {/* <div className="flex items-center">
  //               <input
  //                 id="reg-remember-me"
  //                 name="reg-remember-me"
  //                 type="checkbox"
  //                 className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
  //               />
  //               <label htmlFor="remember-me" className="text-gray-800 ml-3 block text-sm">
  //                 I accept the <a href="#" className="text-blue-600 font-semibold hover:underline ml-1">Terms and Conditions</a>
  //               </label>
  //             </div>
  //             {error && <div className="text-red-600 text-sm mt-2">{error}</div>} */}
  //           </div>

  //           <div className="!mt-8">
  //             <button
  //               type="button"
  //               onClick={handleCreateAccount}
  //               className="w-full py-2.5 px-4 text-sm tracking-wider rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none"
  //             >
	// 			{t('create_account_button')}
  //             </button>
  //           </div>
  //           <div className="flex items-center justify-between mt-4">
  //             <div id="google-login-btn"></div>
  //             <p className="text-gray-800 text-sm">
	// 			{t('already_have_account')}{' '}
  //               <Link to="/login" className="text-blue-600 font-semibold hover:underline ml-1">
	// 			  {t('login_here_button')}
  //               </Link>
  //             </p>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   </div>
  // );
// };

// export default RegisterForm;








// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { handleRegister, googleLogin } from '@/services/authServices';
// import '@/styles/style.css';

// const RegisterForm: React.FC = () => {
//   const navigate = useNavigate();
//   const [pseudo, setPseudo] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState<{ pseudo?: string; email?: string; password?: string; general?: string }>({});
//   const [loading, setLoading] = useState(false);

//   // front-end validation
//   const validate = () => {
//     const newErrors: { pseudo?: string; email?: string; password?: string } = {};
//     if (!/^[A-Za-z0-9_]{1,16}$/.test(pseudo.trim())) {
//       newErrors.pseudo = 'Pseudo must be 1 to 16 characters (letters, numbers, underscore).';
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
//       newErrors.email = 'Invalid email format.';
//     }
//     if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}/.test(password)) {
//       newErrors.password =
//         'Password must have at least 8 characters, including one uppercase, one lowercase, one number, and one special character.';
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleCreateAccount = async () => {
//     // réinitialise les erreurs globales avant tentative
//     setErrors(e => ({ ...e, general: undefined }));
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const res = await handleRegister(pseudo.trim(), email.trim(), password);
//       if (res.success) {
//         // save token and go directly to game1
//         localStorage.setItem('authToken', res.token);
//         navigate('/game1');
//       } else {
//         // mapper le message renvoyé sur le bon champ
//         const msg = res.message || 'Registration failed.';
//         const fieldErrors: typeof errors = {};
//         if (/email/i.test(msg)) fieldErrors.email = msg;
//         else if (/pseudo/i.test(msg)) fieldErrors.pseudo = msg;
//         else if (/password/i.test(msg)) fieldErrors.password = msg;
//         else fieldErrors.general = msg;
//         setErrors(fieldErrors);
//       }
//     } catch {
//       setErrors({ general: 'An error occurred during registration.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleLogin = async (idToken: string) => {
//     // réinitialise les erreurs globales avant tentative Google
//     setErrors(e => ({ ...e, general: undefined }));
//     try {
//       const res = await googleLogin(idToken);
//       if (res.success) {
//         localStorage.setItem('authToken', res.token);
//         navigate('/game1');
//       } else {
//         setErrors(e => ({ ...e, general: res.message || 'Google login failed.' }));
//       }
//     } catch (err) {
//       console.error('Google login error:', err);
//       setErrors(e => ({ ...e, general: 'Google login error.' }));
//     }
//   };

//   useEffect(() => {
//     // load Google script with English locale
//     const script = document.createElement('script');
//     script.src = 'https://accounts.google.com/gsi/client?hl=en';
//     script.async = true;
//     document.body.appendChild(script);
//     script.onload = () => {
//       if (window.google?.accounts) {
//         window.google.accounts.id.initialize({
//           client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
//           callback: (response: any) => handleGoogleLogin(response.credential),
//         });
//         // renderButton without invalid 'text' prop
//         window.google.accounts.id.renderButton(
//           document.getElementById('google-login-btn') as HTMLElement,
//           { theme: 'outline', size: 'large' } as any // cast to any to satisfy TS
//         );
//       }
//     };
//   }, []);

  return (
    <div className="font-[sans-serif] bg-gray-50 flex items-center md:h-screen p-4">
      <div className="w-full max-w-3xl max-md:max-w-xl mx-auto">
        <div className="bg-white grid md:grid-cols-1 gap-12 w-full sm:p-8 p-6 shadow-md rounded-md overflow-hidden">
          <form className="w-full">
            <h3 className="text-gray-800 text-xl mb-4">Register</h3>
            {/* Affichage de l’erreur "générale" */}
            {errors.general && (
              <p className="text-red-600 text-sm mb-4">
                {errors.general}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="reg-pseudo" className="text-gray-800 text-sm mb-2 block">
                  Pseudo
                </label>
                <input
                  id="reg-pseudo"
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                  placeholder="Enter pseudo"
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                />
                {errors.pseudo && <p className="text-red-600 text-sm mt-1">{errors.pseudo}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className="text-gray-800 text-sm mb-2 block">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email"
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="reg-password" className="text-gray-800 text-sm mb-2 block">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm tracking-wider rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div id="google-login-btn"></div>
              <p className="text-gray-800 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline ml-1">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
