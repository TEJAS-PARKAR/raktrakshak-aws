import { useEffect, useState, useMemo } from "react";
import API from "../services/api";

function RecordDonation() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);

  const [inventoryForm, setInventoryForm] = useState({
    units: "",
    donationDate: "",
    notes: ""
  });

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setRecordsLoading(true);
      
      const [donorsRes, inventoryRes] = await Promise.all([
        API.get("/users/donors"),
        API.get("/inventory/my")
      ]);

      setDonors(donorsRes.data.donors || []);
      setRecords(inventoryRes.data.records || []);
    } catch (error) {
      console.error(error);
      alert("Error loading record dashboard");
    } finally {
      setLoading(false);
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInventoryChange = (e) => {
    const { name, value } = e.target;
    setInventoryForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const filteredDonors = useMemo(() => {
    if (!searchTerm) return [];
    return donors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, donors]);

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
    setSearchTerm(donor.name);
  };

  const submitInventoryRecord = async (e) => {
    e.preventDefault();
    if (!selectedDonor) {
      alert("Please select a registered donor first.");
      return;
    }

    try {
      await API.post("/inventory", {
        donorName: selectedDonor.name,
        bloodGroup: selectedDonor.bloodGroup,
        units: Number(inventoryForm.units),
        donationDate: inventoryForm.donationDate,
        notes: inventoryForm.notes
      });

      alert("Donation record added");
      setInventoryForm({ units: "", donationDate: "", notes: "" });
      setSearchTerm("");
      setSelectedDonor(null);
      
      // Reload records to show new entry
      const inventoryRes = await API.get("/inventory/my");
      setRecords(inventoryRes.data.records || []);
    } catch (error) {
      console.log(error);
      alert("Error saving donation record");
    }
  };

  if (user?.role !== "recipient") {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>This section is available only for recipient accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <p className="eyebrow">Recipient Workspace</p>
        <h2>Record Blood Donations</h2>
        <p>Log incoming blood units from registered donors and track donation history.</p>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h3>Register New Donation</h3>
          <form onSubmit={submitInventoryRecord} className="donation-form">
            <div className="search-box" style={{ position: "relative", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Search registered donor by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedDonor && e.target.value !== selectedDonor.name) {
                    setSelectedDonor(null);
                  }
                }}
                required
                style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
              />
              {searchTerm && !selectedDonor && (
                <div className="dropdown-results" style={{ border: "1px solid #ccc", background: "#fff", position: "absolute", zIndex: 10, width: "100%", maxHeight: "200px", overflowY: "auto", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginTop: "4px" }}>
                  {filteredDonors.length > 0 ? (
                    filteredDonors.map(d => (
                      <div 
                        key={d._id} 
                        style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", background: "#fff" }}
                        onClick={() => handleSelectDonor(d)}
                        className="donor-result-row"
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f8ff"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                      >
                        <strong>{d.name}</strong> - {d.bloodGroup}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "10px", color: "var(--danger-color)" }}>No donor found</div>
                  )}
                </div>
              )}
            </div>

            {selectedDonor && (
              <div style={{ marginBottom: "1rem", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "4px", border: "1px solid #ddd" }}>
                <strong>Selected:</strong> {selectedDonor.name} <br/> <strong>Blood Group:</strong> {selectedDonor.bloodGroup}
              </div>
            )}

            <input
              name="units"
              type="number"
              min="1"
              placeholder="Units"
              value={inventoryForm.units}
              onChange={handleInventoryChange}
              required
              style={{ marginBottom: "1rem", width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
            />
            <input
              name="donationDate"
              type="date"
              value={inventoryForm.donationDate}
              onChange={handleInventoryChange}
              style={{ marginBottom: "1rem", width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
            />
            <input
              name="notes"
              placeholder="Notes"
              value={inventoryForm.notes}
              onChange={handleInventoryChange}
              style={{ marginBottom: "1rem", width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
            />
            <button type="submit" disabled={!selectedDonor}>Save Donation Record</button>
          </form>
        </section>

        <section className="card">
          <h3>Recent Donation Records</h3>
          {recordsLoading ? (
            <p>Loading records...</p>
          ) : records.length ? (
            <div style={{maxHeight: "500px", overflowY: "auto"}}>
              {records.map((record) => (
                <div className="list-row" key={record._id}>
                  <strong>{record.donorName}</strong>
                  <p>{record.bloodGroup} - {record.units} units</p>
                  <p>{new Date(record.donationDate).toLocaleDateString()}</p>
                  {record.notes ? <p>{record.notes}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p>No donation records added yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default RecordDonation;
