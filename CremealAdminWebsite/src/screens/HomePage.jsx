import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/Login.css";
import { SplitText } from "../components/SplitText ";

const HomePage = () => {
  const navigate = useNavigate();

  const handleAboutUsClick = () => {
    navigate("/AboutUs"); // Navigates to the AboutUs page
  };
  const handleLoginClick = () => {
    navigate("/Login");
  };
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#333",
    fontFamily: "Arial, sans-serif",
  };

  const buttonsContainerStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
  };

  const buttonStyle = {
    backgroundColor: "#0e82cd",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "10px 20px",
    marginLeft: "10px",
    cursor: "pointer",
    fontSize: "16px",
    outline: "none",
  };

  const buttonHoverStyle = {
    backgroundColor: "#005f8a",
  };

  return (
    <div style={containerStyle}>
      <div style={buttonsContainerStyle}>
        <button
          style={buttonStyle}
          onClick={handleAboutUsClick}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              buttonHoverStyle.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              buttonStyle.backgroundColor)
          }
        >
          About Us
        </button>
        <button
          style={buttonStyle}
          onClick={handleLoginClick}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              buttonHoverStyle.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              buttonStyle.backgroundColor)
          }
        >
          Login
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          overflow: "hidden",
        }}
      >
        <SplitText
          text="Welcome to Creameal"
          className="custom-class"
          delay={50}
          style={{ fontWeight: "700", fontSize: 50, color: "white" }}
        />
        <SplitText
          text="Say goodbye to the wasted food"
          className="custom-class"
          delay={50}
          style={{ fontWeight: "500", fontSize: 25, color: "white" }}
        />
      </div>
    </div>
  );
};
export default HomePage;
