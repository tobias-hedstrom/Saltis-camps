import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import LoginModal from "./LoginModal";

export default function Header() {
  const { currentUser, isLoggedIn, canManageCamps, logout } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  function close() {
    setMenuOpen(false);
    setAccountOpen(false);
  }

  return (
    <header className="site-header">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <div className="header-inner container">
        <Link to="/" className="site-logo" onClick={close}>
          <img src="/src/assets/saltislogo.png" alt="Saltis Ski Club" className="logo-icon" />
          <span className="logo-text">Saltsjöbadens SLK</span>
        </Link>

        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav className={`site-nav ${menuOpen ? "nav-open" : ""}`}>
          <NavLink to="/" end className={navCls} onClick={close}>Home</NavLink>
          <NavLink to="/news" className={navCls} onClick={close}>News</NavLink>
          <NavLink to="/camps" className={navCls} onClick={close}>Camps</NavLink>
          {isLoggedIn && (
            <NavLink to="/my-page" className={navCls} onClick={close}>My Page</NavLink>
          )}
          {canManageCamps && (
            <NavLink to="/admin" className={navCls} onClick={close}>Admin</NavLink>
          )}

          <div className="account-menu">
            {isLoggedIn ? (
              <>
                <button
                  className="account-btn"
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  👤 {currentUser.name.split(" ")[0]}
                </button>
                {accountOpen && (
                  <div className="account-dropdown" onClick={() => setAccountOpen(false)}>
                    <Link to="/my-page" className="dropdown-item" onClick={close}>My Page</Link>
                    <button
                      className="dropdown-item dropdown-toggle"
                      onClick={() => { logout(); close(); }}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="account-btn"
                onClick={() => { setShowLogin(true); close(); }}
              >
                👤 Log In
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function navCls({ isActive }) {
  return `nav-link ${isActive ? "nav-link-active" : ""}`;
}
