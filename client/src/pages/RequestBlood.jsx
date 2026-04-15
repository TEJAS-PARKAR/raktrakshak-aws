import { useEffect, useState } from "react";
import API from "../services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialInventoryForm = {
  donorName: "",
  bloodGroup: "",
  units: "",
  donationDate: "",
  notes: ""
};

const initialRequestForm = {
  patientName: "",
  bloodGroup: "",
  hospital: "",
  city: "",
  contact: "",
  unitsRequired: 1
};

function RequestBlood() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [availability, setAvailability] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [inventoryRes, requestsRes] = await Promise.all([
        API.get("/inventory/my"),
        API.get("/requests/my")
      ]);

      setAvailability(inventoryRes.data.availability || []);
      setRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.log(error);
      alert("Error loading recipient dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const submitBloodRequest = async (e) => {
    e.preventDefault();

    try {
      await API.post("/requests", {
        ...requestForm,
        unitsRequired: Number(requestForm.unitsRequired)
      });

      alert("Blood request created successfully");
      setRequestForm(initialRequestForm);
      loadDashboard();
    } catch (error) {
      console.log(error);
      alert("Error creating request");
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(`/requests/my/${id}`, { status });
      loadDashboard();
    } catch (error) {
      console.log(error);
      alert("Error updating request status");
    }
  };

  if (user?.role !== "recipient") {
    return (
      <div className="container">
        <div className="card">
          <h2>Recipient Dashboard</h2>
          <p>This section is available only for recipient accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <p className="eyebrow">Recipient Workspace</p>
        <h2>Manage requests and blood availability</h2>
        <p>
          {user?.institutionName || user?.name} can view current blood units, and raise requests for patients from this dashboard.
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>

        <section className="card">
          <h3>Create Blood Request</h3>
          <form onSubmit={submitBloodRequest}>
            <input
              name="patientName"
              placeholder="Patient Name"
              value={requestForm.patientName}
              onChange={handleRequestChange}
              required
            />
            <select
              name="bloodGroup"
              value={requestForm.bloodGroup}
              onChange={handleRequestChange}
              required
            >
              <option value="">Required Blood Group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <input
              name="unitsRequired"
              type="number"
              min="1"
              placeholder="Units Required"
              value={requestForm.unitsRequired}
              onChange={handleRequestChange}
              required
            />
            <input
              name="hospital"
              placeholder="Hospital"
              value={requestForm.hospital}
              onChange={handleRequestChange}
              required
            />
            <input
              name="city"
              placeholder="City"
              value={requestForm.city}
              onChange={handleRequestChange}
              required
            />
            <input
              name="contact"
              placeholder="Contact"
              value={requestForm.contact}
              onChange={handleRequestChange}
              required
            />
            <button type="submit">Submit Request</button>
          </form>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h3>Blood Availability</h3>
          {loading ? (
            <p>Loading availability...</p>
          ) : availability.length ? (
            <div className="stat-list">
              {availability.map((item) => (
                <div className="stat-item" key={item.bloodGroup}>
                  <div>
                    <strong>{item.bloodGroup}</strong>
                    <p>{item.donorMatches} matching donors registered</p>
                  </div>
                  <div className="stat-badge">{item.totalUnits} units</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No inventory recorded yet.</p>
          )}
        </section>

      </div>

      <section className="card">
        <h3>Your Blood Requests</h3>
        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length ? (
          requests.map((request) => (
            <div className="list-row" key={request._id}>
              <strong>{request.patientName}</strong>
              <p>{request.bloodGroup} - {request.unitsRequired} units</p>
              <p>{request.hospital}, {request.city}</p>
              <p>Status: {request.status}</p>
              {request.status === "pending" && (
                <div className="action-row">
                  <button type="button" onClick={() => updateRequestStatus(request._id, "fulfilled")}>
                    Mark Fulfilled
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => updateRequestStatus(request._id, "cancelled")}
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No requests submitted yet.</p>
        )}
      </section>
    </div>
  );
}

export default RequestBlood;
