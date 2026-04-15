import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const setSession = async () => {
      try {
        const meRes = await API.get("/auth/me");

        if (meRes.data.success && meRes.data.user) {
          localStorage.setItem("token", "cookie-session");
          localStorage.setItem("user", JSON.stringify(meRes.data.user));

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
