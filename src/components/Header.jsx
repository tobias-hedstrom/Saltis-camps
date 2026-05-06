import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";

export default function Header({ onLoginClick }) {
  const { currentUser, isLoggedIn, canManageCamps, logout } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function close() {
    setMenuOpen(false);
    setAccountOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link to="/" className="site-logo" onClick={close}>
          <img src="/saltislogo.png" alt="Saltsjöbadens SLK" className="logo-icon" />
          <span className="logo-text">Saltsjöbadens SLK</span>
        </Link>

        <button
          className="hamburger"
          aria-label="Öppna meny"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav className={`site-nav ${menuOpen ? "nav-open" : ""}`}>
          <NavLink to="/" end className={navCls} onClick={close}>Start</NavLink>
          <NavLink to="/news" className={navCls} onClick={close}>Nyheter</NavLink>
          <NavLink to="/camps" className={navCls} onClick={close}>Läger</NavLink>
          {isLoggedIn && (
            <NavLink to="/my-page" className={navCls} onClick={close}>Min sida</NavLink>
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
                  {currentUser.name.split(" ")[0]}
                </button>
                {accountOpen && (
                  <div className="account-dropdown" onClick={() => setAccountOpen(false)}>
                    <Link to="/my-page" className="dropdown-item" onClick={close}>Min sida</Link>
                    <button
                      className="dropdown-item dropdown-toggle"
                      onClick={() => { logout(); close(); }}
                    >
                      Logga ut
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="account-btn"
                onClick={() => { onLoginClick?.(); close(); }}
              >
                Logga in
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
