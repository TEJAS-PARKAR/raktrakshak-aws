import { useEffect, useState } from "react";
import API from "../services/api";

function ActiveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await API.get("/requests");
        const allRequests = res.data.requests || [];
        
        // Only show pending requests, effectively newest first (assuming ascending creation default, but reversing ensures newest if not sorted)
        const pending = allRequests.filter(r => r.status === "pending").reverse();
        setRequests(pending);
      } catch (error) {
        console.error(error);
        alert("Error fetching active requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Active Blood Requests</h2>
        <p>Current patient needs from hospitals and blood banks. Please contact them directly if you can donate.</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem" }}>Loading requests...</p>
      ) : requests.length > 0 ? (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {requests.map(req => (
            <div className="card" key={req._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>{req.bloodGroup} Needed</h3>
                <span className="stat-badge" style={{ padding: "4px 8px", fontSize: "0.9rem" }}>{req.unitsRequired} Units</span>
              </div>
              <p><strong>Patient:</strong> {req.patientName}</p>
              <p><strong>Hospital:</strong> {req.hospital}, {req.city}</p>
              
              <hr style={{ margin: "15px 0", borderTop: "1px solid #eee" }} />
              
              <h4 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "0.9rem", textTransform: "uppercase" }}>Contact Details</h4>
              <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--primary-color)" }}>{req.contact}</p>
              
              {req.recipient && (
                <p style={{ marginTop: "5px", color: "#555" }}>
                  <strong>Requested by:</strong> {req.recipient.institutionName || req.recipient.name}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h3 style={{ color: "#666" }}>No Active Requests</h3>
          <p>There are no active blood requests right now. Thank you for your commitment to saving lives!</p>
        </div>
      )}
    </div>
  );
}

export default ActiveRequests;
