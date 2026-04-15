import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import API from "../services/api";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token") || localStorage.getItem("user"))
  );
  
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("token") || localStorage.getItem("user")));
    };
    
    window.addEventListener("auth-updated", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-updated", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-updated"));
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <nav className="navbar">
      <h2 className="logo">RaktRakshak</h2>

      <div className="links">
        {isAuthenticated ? (
          <>
            <NavLink to="/" className="nav-link">Home</NavLink>
            {user?.applicationStatus !== "pending" && (
              <NavLink to="/find-donor" className="nav-link">Find Donor</NavLink>
            )}
            {user?.role === "donor" && user?.applicationStatus !== "pending" && (
              <NavLink to="/active-requests" className="nav-link">Active Requests</NavLink>
            )}
            {user?.role === "recipient" && user?.applicationStatus !== "pending" && (
              <>
                <NavLink to="/record-donation" className="nav-link">Record Donation</NavLink>
                <NavLink to="/request-blood" className="nav-link">Request Blood</NavLink>
              </>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className="nav-link">Admin</NavLink>
            )}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <NavLink to="/login" className="nav-link">Login</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
