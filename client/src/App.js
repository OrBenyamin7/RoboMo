import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Header from "./Components/Header/Header";
import Body from "./Components/Body/Body";
import Footer from "./Components/Footer/Footer";
import Login from "./Components/Login/Login";
import "./App.css";
import "./index.css";

export const AppDarkMode = createContext();

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [user, setUser] = useState(null); // Track authenticated user

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Function to calculate and set the scale factor
  const calculateScale = () => {
    const baseWidth = 1920;
    const baseHeight = 1080;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const widthRatio = screenWidth / baseWidth;
    const heightRatio = screenHeight / baseHeight;
    const newScale = Math.min(widthRatio, heightRatio);
    setScale(newScale);
  };

  useEffect(() => {
    // Calculate scale on mount and resize
    calculateScale();
    window.addEventListener("resize", calculateScale);

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", calculateScale);
    };
  }, []);

  // Track user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          alert("Please verify your email before accessing the application.");
          auth.signOut(); // Optionally log the user out
        } else {
          console.log("User is verified:", currentUser);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AppDarkMode.Provider value={darkMode}>
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        style={{
          zoom: scale,
          transformOrigin: "top left",
        }}
      >
        {user ? (
          <>
            <Header toggleDarkMode={toggleDarkMode} />
            <Body />
            <Footer />
          </>
        ) : (
          <Login />
        )}
        {/* <Header toggleDarkMode={toggleDarkMode} />
        <Body />
        <Footer /> */}
      </div>
    </AppDarkMode.Provider>
  );
}

export default App;
