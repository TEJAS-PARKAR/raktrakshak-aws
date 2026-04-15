import { useLocation, useNavigate } from "react-router-dom";

function ApprovalPending() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="container">
      <div className="card">
        <p className="eyebrow">Registration Received</p>
        <h2>We have received your registration application</h2>
        <p>
          {user?.institutionName || user?.name || "Your account"} is currently awaiting admin approval.
          Kindly wait for 24 hours for your approval.
        </p>
        <p>
          Once the admin approves your donor or recipient account, you can sign in normally with the same Google account.
        </p>
        <button type="button" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ApprovalPending;
