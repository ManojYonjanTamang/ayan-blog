import { useState } from "react";
import { Navigate } from "react-router-dom";
import "../styles/forms.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [registerError, setRegisterError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters long";
    }
    
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function register(e) {
    e.preventDefault();
    setRegisterError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          setRedirect(true);
        }, 2000);
      } else {
        const data = await response.json();
        setRegisterError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setRegisterError("An error occurred. Please try again.");
    }
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <form className="form-container" onSubmit={register}>
      <h1 className="form-title">Register</h1>
      
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setValidationErrors(prev => ({ ...prev, username: "" }));
          }}
          className={validationErrors.username ? "error" : ""}
        />
        {validationErrors.username && (
          <div className="error-message">{validationErrors.username}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setValidationErrors(prev => ({ ...prev, password: "" }));
          }}
          className={validationErrors.password ? "error" : ""}
        />
        {validationErrors.password && (
          <div className="error-message">{validationErrors.password}</div>
        )}
      </div>

      {registerError && <div className="message error">{registerError}</div>}
      {successMessage && <div className="message success">{successMessage}</div>}

      <button type="submit" className="btn btn-success">Register</button>
    </form>
  );
}
