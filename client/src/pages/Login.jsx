import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <p>Please login with Google:</p>
      <button onClick={handleGoogleLogin} className="google-login-btn">
        Continue with Google
      </button>
    </div>
  );
}

export default Login;