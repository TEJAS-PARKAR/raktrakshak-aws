import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import LoginSuccess from "./pages/LoginSuccess";
import FindDonor from "./pages/FindDonor";
import RequestBlood from "./pages/RequestBlood";
import RecordDonation from "./pages/RecordDonation";
import ActiveRequests from "./pages/ActiveRequests";
import AdminDashboard from "./pages/AdminDashboard";
import ApprovalPending from "./pages/ApprovalPending";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import API from "./services/api";

function App() {
  useEffect(() => {
    const syncSession = async () => {
      try {
        const res = await API.get("/auth/me");

        if (res.data.success && res.data.user) {
          localStorage.setItem("token", "cookie-session");
          localStorage.setItem("user", JSON.stringify(res.data.user));
          window.dispatchEvent(new Event("auth-updated"));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-updated"));
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-updated"));
      }
    };

    syncSession();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/approval-pending" element={<ApprovalPending />} />
        <Route path="/register" element={<Register />} />
        <Route path="/find-donor" element={<FindDonor />} />
        <Route
          path="/request-blood"
          element={
            <PrivateRoute role="recipient">
              <RequestBlood />
            </PrivateRoute>
          }
        />
        <Route
          path="/record-donation"
          element={
            <PrivateRoute role="recipient">
              <RecordDonation />
            </PrivateRoute>
          }
        />
        <Route
          path="/active-requests"
          element={
            <PrivateRoute role="donor">
              <ActiveRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
