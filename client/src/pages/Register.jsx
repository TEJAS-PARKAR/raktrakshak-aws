import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { State, City } from "country-state-city";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    phone: "",
    state: "",
    city: "",
    institutionName: "",
    role: ""
  });
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [formMode, setFormMode] = useState("google");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const states = State.getStatesOfCountry("IN");
  const cities = selectedStateCode ? City.getCitiesOfState("IN", selectedStateCode) : [];

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const res = await API.get("/auth/me");

        if (res.data.success && res.data.profile) {
          const profile = res.data.profile;
          setFormData({
            name: profile.name || "",
            email: "",
            bloodGroup: "",
            phone: "",
            state: "",
            city: "",
            institutionName: "",
            role: ""
          });
          setFormMode("google");
        } else if (res.data.success && res.data.user && !res.data.user.isProfileComplete) {
          const user = res.data.user;
          const selected = states.find((item) => item.name === user.state);
          setFormData({
            name: user.name || "",
            email: "",
            bloodGroup: user.bloodGroup || "",
            phone: user.phone || "",
            state: user.state || "",
            city: user.city || "",
            institutionName: user.institutionName || "",
            role: user.role || ""
          });
          setSelectedStateCode(selected?.isoCode || "");
          setFormMode("update");
        }
      } catch (error) {
        console.log("Registration preload skipped:", error?.response?.data?.message || error.message);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchAuthUser();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === "state") {
      const selected = states.find((item) => item.name === value);
      setFormData({
        ...formData,
        state: value,
        city: ""
      });
      setSelectedStateCode(selected?.isoCode || "");
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      let verifiedEmail = formData.email;

      if (!verifiedEmail) {
        const meRes = await API.get("/auth/me");
        verifiedEmail = meRes.data?.profile?.email || meRes.data?.user?.email || "";
      }

      if (!verifiedEmail) {
        setSubmitError("Please continue with Google first so we can verify your email.");
        return;
      }

      const payload = {
        ...formData,
        email: verifiedEmail
      };

      const res = formMode === "update"
        ? await API.put("/users/update", payload)
        : await API.post("/users/register", payload);

      navigate("/approval-pending", { state: { user: res.data.user } });
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      const serverError = error?.response?.data?.error;
      const message = serverMessage && serverMessage !== "Registration error"
        ? serverMessage
        : serverError || serverMessage || error.message;
      setSubmitError(message);
      console.error("Registration error details:", error);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="register-shell">
        <div className="register-panel register-panel--info">
          <p className="eyebrow">Preparing Registration</p>
          <h2>Loading your verified Google profile...</h2>
          <p>Please wait a moment while we bring in your email and account details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-shell">
      <div className="register-panel register-panel--info">
        <p className="eyebrow">RaktRakshak Onboarding</p>
        <h1>Register as a donor or recipient</h1>
        <p className="register-lead">
          We use your Google account to verify identity first, then collect the details needed for admin approval.
        </p>
        <div className="register-highlight">
          <strong>What happens next?</strong>
          <p>Submit your details, wait for admin review, and your account will be approved within 24 hours.</p>
        </div>
        <div className="register-steps">
          <div className="register-step">
            <span>1</span>
            <p>Choose whether you are registering as a donor or recipient.</p>
          </div>
          <div className="register-step">
            <span>2</span>
            <p>Fill in your verified profile and contact details.</p>
          </div>
          <div className="register-step">
            <span>3</span>
            <p>Wait for admin approval before accessing the protected sections.</p>
          </div>
        </div>
      </div>

      <div className="register-panel register-panel--form">
        <div className="register-header">
          <h2>{formMode === "update" ? "Complete Your Profile" : "Finish Registration"}</h2>
          <p>Your Google account will be used behind the scenes to verify the registration email.</p>
        </div>

        {!formData.email && (
          <div className="register-alert">
            <strong>Google verification required.</strong>
            <p>Go back to login and use Continue with Google before registering.</p>
          </div>
        )}

        {submitError && (
          <div className="register-alert register-alert--error">
            <strong>Registration could not be submitted.</strong>
            <p>{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="role-toggle">
            <label className={`role-card ${formData.role === "donor" ? "role-card--active" : ""}`}>
              <input
                type="radio"
                name="role"
                value="donor"
                checked={formData.role === "donor"}
                onChange={handleChange}
                required
              />
              <span>Donor</span>
              <small>Share blood details and become available after approval.</small>
            </label>
            <label className={`role-card ${formData.role === "recipient" ? "role-card--active" : ""}`}>
              <input
                type="radio"
                name="role"
                value="recipient"
                checked={formData.role === "recipient"}
                onChange={handleChange}
                required
              />
              <span>Recipient</span>
              <small>Manage requests and blood inventory for patients and institutions.</small>
            </label>
          </div>

          {formData.role !== "recipient" && (
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          {formData.role === "recipient" && (
            <input
              name="institutionName"
              placeholder="Institution Name"
              value={formData.institutionName}
              onChange={handleChange}
              required
            />
          )}
          {formData.role === "donor" && (
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          )}
          <input
            name="phone"
            placeholder="Phone (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            maxLength="10"
            required
          />
          <div className="register-form-grid">
            <select
              name="state"
              value={formData.state}
              onChange={handleLocationChange}
              required
            >
              <option value="">Select State</option>
              {states.map((item) => (
                <option key={item.isoCode} value={item.name}>{item.name}</option>
              ))}
            </select>
            <select
              name="city"
              value={formData.city}
              onChange={handleLocationChange}
              required
              disabled={!selectedStateCode}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          <button type="submit">
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
