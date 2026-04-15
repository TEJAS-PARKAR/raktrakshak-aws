import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchDashboard = async () => {
    try {
      const usersRes = await API.get("/users/pending");
      setPendingUsers(usersRes.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const approveUser = async (id) => {
    try {
      await API.put(`/users/${id}/approve`);
      alert("User approved successfully");
      fetchDashboard();
    } catch (error) {
      console.log(error);
      alert("Error approving user");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="container">

        <h2>Admin Dashboard</h2>

        <div className="card">
          <h3>Pending Registrations</h3>
          {pendingUsers.length ? (
            pendingUsers.map((user) => (
              <div className="list-row" key={user._id}>
                <strong>{user.institutionName || user.name}</strong>
                <p>Role: {user.role}</p>
                <p>Email: {user.email}</p>
                <p>City: {user.city}</p>
                <button onClick={() => approveUser(user._id)}>
                  Approve Registration
                </button>
              </div>
            ))
          ) : (
            <p>No pending registrations right now.</p>
          )}
        </div>

    </div>
  );
}

export default AdminDashboard;
