import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import "../styles/forms.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const { setUserInfo } = useContext(UserContext);

  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = "Username is required";
    }
    if (!password.trim()) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function login(e) {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (response.ok) {
        response.json().then((userInfo) => {
          setUserInfo(userInfo);
          setRedirect(true);
        });
      } else {
        setLoginError("Invalid username or password");
      }
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <form className="form-container" onSubmit={login}>
      <h1 className="form-title">Login</h1>
      
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
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
          placeholder="Enter your password"
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

      {loginError && <div className="message error">{loginError}</div>}

      <button type="submit" className="btn btn-primary">Login</button>
    </form>
  );
}
