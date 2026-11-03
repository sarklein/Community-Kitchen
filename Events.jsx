import { useEffect, useState } from "react";
import "./Kitchen.css";

const API_URL =
  "https://irisy.sg-host.com/dist";

function Events() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  /*
   * Load events when the page opens.
   */
  useEffect(() => {
    loadEvents();
  }, []);

  /*
   * Get all upcoming events from PHP.
   */
  async function loadEvents() {
    try {
      const response = await fetch(
        `${API_URL}/events.php?action=list&t=${Date.now()}`,
        {
          cache: "no-store"
        }
      );

      const result = await response.json();

      if (result.success) {
        setEvents(result.events || []);
      } else {
        setStatus("error");
        setMessage(
          result.message || "Could not load events."
        );
      }

    } catch (error) {
      console.error(error);

      setStatus("error");
      setMessage("Unable to reach server.");
    }
  }

  /*
   * Sign the current user up for an event.
   */
  async function joinEvent(eventId) {
    const userId =
      localStorage.getItem("user_id");

    if (!userId) {
      setStatus("error");
      setMessage(
        "Please register before signing up for an event."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/events.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            action: "join",
            event_id: eventId,
            user_id: Number(userId)
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setStatus("success");

        setMessage(
          result.message ||
            "You signed up for the dinner!"
        );

        /*
         * Reload events so guest_count
         * immediately increases.
         */
        await loadEvents();

      } else {
        setStatus("error");

        setMessage(
          result.message ||
            "Could not join the event."
        );
      }

    } catch (error) {
      console.error(error);

      setStatus("error");
      setMessage("Unable to reach server.");
    }
  }

  return (
    <div className="kitchen-page">

      <div className="kitchen-header">
        <h1 className="kitchen-title">
          Community Kitchen
        </h1>

        <p className="kitchen-subtitle">
          Upcoming Dinner Nights
        </p>
      </div>

      {message && (
        <p
          className={
            `status-message page-status ${status}`
          }
        >
          {message}
        </p>
      )}

      <div className="events-grid">

        {events.length === 0 ? (

          <div className="kitchen-card empty-card">
            <p>No upcoming events found.</p>
          </div>

        ) : (

          events.map((event) => {
            const guestCount =
              Number(event.guest_count);

            const maxGuests =
              Number(event.max_guests);

            const isFull =
              guestCount >= maxGuests;

            return (
              <div
                className={
                  `kitchen-card event-card ${
                    isFull ? "event-full" : ""
                  }`
                }
                key={event.event_id}
              >

                <h2>
                  {event.event_name}
                </h2>

                <p>
                  <strong>Date:</strong>{" "}
                  {event.event_date}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {event.start_time}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {event.city},{" "}
                  {event.state}{" "}
                  {event.zip_code}
                </p>

                <p className="guest-count">
                  <strong>
                    {guestCount} of {maxGuests}
                  </strong>{" "}
                  guests signed up
                </p>

                <button
                  className="kitchen-button"
                  disabled={isFull}
                  onClick={() =>
                    joinEvent(event.event_id)
                  }
                >
                  {isFull
                    ? "Dinner Full"
                    : "Sign Up"}
                </button>

              </div>
            );
          })

        )}

      </div>

    </div>
  );
}

export default Events;