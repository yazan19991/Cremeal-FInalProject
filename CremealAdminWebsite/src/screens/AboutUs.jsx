// AboutUs.js
import React from "react";
const AboutUs = () => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "20px",
  };

  const headerTextStyle = {
    color: "#0e82cd",
    fontSize: "2.5rem",
  };

  const contentStyle = {
    textAlign: "left",
  };

  const titleStyle = {
    color: "#333",
    fontSize: "2rem",
    marginBottom: "10px",
  };

  const paragraphStyle = {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    marginBottom: "15px",
    color: "#555",
  };

  const strongStyle = {
    color: "#0e82cd",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={containerStyle}>
        <header style={headerStyle}>
          <h1 style={headerTextStyle}>About Us</h1>
        </header>
        <section style={contentStyle}>
          <h2 style={titleStyle}>Welcome to Creameal</h2>
          <p style={paragraphStyle}>
            At <strong style={strongStyle}>Creameal</strong>, we're passionate
            about transforming the way you cook and enjoy meals. Our vision is
            simple yet revolutionary: to create personalized recipes based on
            what you already have in your fridge.
          </p>
          <p style={paragraphStyle}>
            Imagine standing in front of your refrigerator, unsure of what to
            cook with the ingredients you have on hand. Creameal is here to
            change that. With just a photo of the contents in your fridge, our
            cutting-edge technology analyzes your ingredients and generates
            delicious, tailored recipes just for you. Whether you're in the mood
            for a hearty dinner or a quick snack, we’ve got you covered.
          </p>
          <p style={paragraphStyle}>
            Our mission is to make meal planning effortless and exciting, giving
            you the freedom to explore new dishes without the stress of figuring
            out what to cook. We believe that great meals should start with what
            you already have, making cooking a delightful experience rather than
            a chore.
          </p>
          <p style={paragraphStyle}>
            At Creameal, we're dedicated to helping you discover the joy of
            cooking with the ingredients you already love. Join us in redefining
            mealtime, one photo at a time.
          </p>
          <p style={paragraphStyle}>
            Founded in 2024 by ,Hassan Jbara, and Yazzan Herzallah, Creameal is
            here to revolutionize your cooking experience.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
