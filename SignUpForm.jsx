import { useState } from "react";
import "./Kitchen.css";

const API_URL =
  "https://irisy.sg-host.com/dist";

function SignUpForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    zip_code: ""
  });

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/users.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "register",
            ...formData
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        localStorage.setItem(
          "user_id",
          result.user_id
        );

        localStorage.setItem(
          "first_name",
          formData.first_name
        );

        localStorage.setItem(
          "last_name",
          formData.last_name
        );

        localStorage.setItem(
          "email",
          formData.email
        );

        localStorage.setItem(
          "zip_code",
          formData.zip_code
        );

        setStatus("success");
        setMessage("Registered successfully!");

        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          zip_code: ""
        });

      } else {
        setStatus("error");
        setMessage(
          result.message ||
          "Something went wrong."
        );
      }

    } catch (error) {
      console.error(error);

      setStatus("error");
      setMessage("Unable to reach server.");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/users.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "login",
            email: loginEmail
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        const user = data.user;

        localStorage.setItem(
          "user_id",
          user.user_id
        );

        localStorage.setItem(
          "first_name",
          user.first_name
        );

        localStorage.setItem(
          "last_name",
          user.last_name
        );

        localStorage.setItem(
          "email",
          user.email
        );

        localStorage.setItem(
          "zip_code",
          user.zip_code
        );

        setStatus("success");

        setMessage(
          `Welcome back, ${user.first_name}!`
        );

        setLoginEmail("");

      } else {
        setStatus("error");

        setMessage(
          data.message ||
          "Could not sign in."
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
          Registration
        </p>
      </div>


      <form
        className="kitchen-card signup-card"
        onSubmit={handleSubmit}
      >

        <input
          className="kitchen-input"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <input
          className="kitchen-input"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <input
          className="kitchen-input"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="kitchen-input"
          name="zip_code"
          placeholder="Zip Code"
          value={formData.zip_code}
          onChange={handleChange}
          required
        />

        <button
          className="kitchen-button"
          type="submit"
        >
          Register
        </button>

      </form>


      <div className="kitchen-card login-card">

        <h2>
          Already Registered?
        </h2>

        <form onSubmit={handleLogin}>

          <input
            className="kitchen-input"
            type="email"
            placeholder="Enter your email"
            value={loginEmail}
            onChange={(event) =>
              setLoginEmail(
                event.target.value
              )
            }
            required
          />

          <button
            className="kitchen-button"
            type="submit"
          >
            Sign In
          </button>

        </form>

      </div>


      {message && (
        <p
          className={
            `status-message ${status}`
          }
        >
          {message}
        </p>
      )}

    </div>
  );
}

export default SignUpForm;