import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import "./Header.css";

export default function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);

  const username = userInfo?.username;

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    }).then(() => {
      setUserInfo(null);
      // Trigger storage event for cross-tab logout
      localStorage.setItem('logout', Date.now().toString());
    });
  }

  return (
    <header>
      <Link to="/" className="logo">
        Agri Blog
      </Link>

      <nav>
        {username ? (
          <>
            <Link to="/create">Create New Post</Link>
            <a onClick={logout} className="logout-btn">Logout</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
