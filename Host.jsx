import { useState } from "react";
import "./Kitchen.css";

const API_URL = "https://irisy.sg-host.com/dist";

function Host() {
  const currentUserId = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    event_name: "",
    event_date: "",
    start_time: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    max_guests: 6
  });

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "state" ? value.toUpperCase() : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      setStatus("error");
      setMessage("Please register before hosting an event.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/events.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          host_user_id: Number(currentUserId),
          ...formData,
          max_guests: Number(formData.max_guests)
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setMessage(`Event created! Event ID is ${result.event_id}`);
        setFormData({
          event_name: "",
          event_date: "",
          start_time: "",
          address: "",
          city: "",
          state: "",
          zip_code: "",
          max_guests: 6
        });
      } else {
        setStatus("error");
        setMessage(result.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Unable to reach server.");
    }
  };

  return (
    <div className="kitchen-page">
      <div className="kitchen-header">
        <h1 className="kitchen-title">Community Kitchen</h1>
        <p className="kitchen-subtitle">Host a Dinner Night</p>
      </div>

      <p className="host-user-summary">
        {currentUserId
          ? <>Hosting as <strong>{localStorage.getItem("first_name") || "registered user"}</strong></>
          : "Please register before creating an event."}
      </p>

      <form className="kitchen-card host-card" onSubmit={handleSubmit}>
        {[
          ["event_name", "Event Name", "Mystery Recipe", "text"],
          ["event_date", "Event Date", "", "date"],
          ["start_time", "Start Time", "", "time"],
          ["address", "Address", "123 Main St", "text"],
          ["city", "City", "Cambridge", "text"],
          ["state", "State", "MA", "text"],
          ["zip_code", "Zip Code", "02142", "text"],
          ["max_guests", "Maximum Guests", "", "number"]
        ].map(([name, label, placeholder, type]) => (
          <div className="field-group" key={name}>
            <label className="label">{label}</label>
            <input
              className="kitchen-input"
              name={name}
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              min={name === "max_guests" ? 2 : undefined}
              max={name === "max_guests" ? 50 : name === "state" ? undefined : undefined}
              maxLength={name === "state" ? 2 : undefined}
              required
            />
          </div>
        ))}

        <button className="kitchen-button" type="submit">Create Host Event</button>
        {message && <p className={`status-message ${status}`}>{message}</p>}
      </form>
    </div>
  );
}

export default Host;