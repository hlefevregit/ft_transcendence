import i18next from 'i18next'

export const handleEmailLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/sign_in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("📡 Login API response:", data); // 👈 utile pour voir la vraie structure

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || i18next.t('api_login_error'),
      };
    }

    return {
      success: true,
      token: data.token,
      user: data.user ?? null, // 👈 important pour éviter "undefined"
    };
  } catch (err) {
    console.error("❌ Login fetch error:", err);
    return { success: false, message: i18next.t('api_login_error') };
  }
};


  export const handleRegister = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    return response.json();
  };

  export const googleLogin = async (idToken: string) => {
    const response = await fetch('/api/auth/google', {
        method: 'POST',
        credentials: 'include', // Assurez-vous que les cookies sont inclus
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
    });
    return response.json();
};

export const handle2FALogin = async (totp: string) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error(i18next.t('api_no_auth_token_error'));
  }
  const res = await fetch('/api/2fa/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Ajout du token d'authentification
    },
    body: JSON.stringify({ token: totp }),
  });
  return res.json();
};
