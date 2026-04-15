import { useState } from "react";
import API from "../services/api";

function FindDonor() {

  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!bloodGroup) {
      alert("Please select a blood group first.");
      return;
    }

    try {
      const res = await API.get(`/users/blood/${encodeURIComponent(bloodGroup)}`);
      setDonors(res.data.donors); 
      setHasSearched(true);

    } catch (error) {
      console.log(error);
      alert("Error fetching donors");
    }
  };

  return (
    <div className="container">

        <h2>Find Donor</h2>

        <select
            className="blood-group-select"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
        >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
        </select>

        <button onClick={handleSearch}>Search</button>

        {hasSearched && donors.length === 0 && (
          <p style={{ marginTop: "1rem", color: "#666" }}>No donors found for this blood group.</p>
        )}

        {donors.map((d) => (
            <div className="card" key={d._id}>
            <h3>{d.name}</h3>
            <p>Blood Group: {d.bloodGroup}</p>
            <p>City: {d.city}</p>
            <p>Phone: {d.phone}</p>
            </div>
        ))}

        </div>
  );
}

export default FindDonor;