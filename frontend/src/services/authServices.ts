export const handleEmailLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.json();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
    });
    return response.json();
};
