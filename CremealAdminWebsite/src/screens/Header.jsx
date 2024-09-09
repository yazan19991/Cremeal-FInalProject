import React, { memo } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../assets/styles/Header.css";
const Header = () => {
  const logoStyle = {
    height: "80px",
    marginRight: "15px",
    cursor: "pointer",
  };
  return (
    <header className="headerFixed">
      <Link to="/">
        <img src={logo} alt="Logo" style={logoStyle} />
      </Link>
    </header>
  );
};

export default Header;
