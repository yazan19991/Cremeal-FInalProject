import React from "react";
import styled, { keyframes } from "styled-components";

// Keyframes for animations
const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-image: url('/01.jpg'); /* Replace 'path_to_your_image.jpg' with your image URL */
  background-size: cover;
  background-position: center;
  color: white;
  position: relative; /* Ensure position context for absolute positioning */
`;


const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: ${fadeInDown} 1s ease-in-out;
`;

const Description = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 1s ease-in-out;
`;

const AboutUs = styled.p`
  font-size: 1.2rem;
  font-style: italic;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 1s ease-in-out;
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 20px; /* Adjust this value to position from top */
  right: 20px; /* Adjust this value to position from right */
`;

const Button = styled.button`
  background-color: white;
  color: #0e82cd;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-5px);
  }

  &:focus {
    outline: none;
    animation: ${pulse} 1s infinite;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  animation: ${fadeInUp} 1s ease-in-out;
`;

const Image = styled.img`
  width: 200px;
  height: auto;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export default function Home() {
  return (
    <HomeContainer>
     /* <ButtonContainer>
        <Button href = "/Login">Log in</Button>
      </ButtonContainer>
      <Title>Welcome to creameal</Title>
      <Description>Generate delicious meals with a click of a button.</Description>
      <AboutUs>We are creating your dream meal...</AboutUs>
      <ImageContainer>
        <Image src="https://via.placeholder.com/200" alt="Meal Image" />
      </ImageContainer>*/
    </HomeContainer>
    
  );
}
