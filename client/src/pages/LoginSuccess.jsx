import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const setSession = async () => {
      try {
        // Read token from URL ?token=xxx (set by backend after Google OAuth)
        const urlToken = searchParams.get("token");
        if (urlToken) {
          localStorage.setItem("token", urlToken);
        }

        const meRes = await API.get("/auth/me");

        if (meRes.data.success && meRes.data.user) {
          localStorage.setItem("user", JSON.stringify(meRes.data.user));
          window.dispatchEvent(new Event("auth-updated"));

          if (meRes.data.user.applicationStatus === "pending") {
            window.location.href = "/approval-pending";
            return;
          }

          if (meRes.data.user.role === "admin") {
            window.location.href = "/admin";
            return;
          }

          window.location.href = "/";
          return;
        }

        navigate("/login");
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    setSession();
  }, [navigate, searchParams]);

  return (
    <div className="container">
      <h2>Login successful</h2>
      <p>Redirecting…</p>
    </div>
  );
}

export default LoginSuccess;
