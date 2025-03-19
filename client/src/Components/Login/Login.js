import React, { useState, useContext } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import { AppDarkMode } from "../../App";

const Login = () => {
  const darkMode = useContext(AppDarkMode); // Access dark mode context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New username field
  const [isNewUser, setIsNewUser] = useState(false); // Toggle between login and sign-up modes
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback message for user actions

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user);
      window.location.reload();
    } catch (error) {
      console.error("Google login failed:", error.message);
      setFeedbackMessage("Google login failed. Please try again.");
    }
  };

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", result.user);
      window.location.reload();
    } catch (error) {
      console.error("Email login failed:", error.message);
      setFeedbackMessage("Invalid email or password. Please try again.");
    }
  };

  const handleEmailSignUp = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", result.user);

      // Set the display name for the new user
      await updateProfile(result.user, {
        displayName: username, // Add the username to the user's profile
      });
      console.log("Username set:", username);

      // Send a verification email
      await sendEmailVerification(result.user);
      console.log("Verification email sent.");

      setFeedbackMessage(
        "Sign-up successful! A verification email has been sent. Please check your email to verify your account."
      );

      // Log out the user until they verify their email
      await signOut(auth);
    } catch (error) {
      console.error("Sign-up failed:", error.message);
      setFeedbackMessage("Sign-up failed. Please try again.");
    }
  };

  return (
    <div
      className={`flex items-center justify-center h-screen ${
        darkMode ? "bg-[#304463] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`p-6 rounded shadow-md w-full max-w-md ${
          darkMode ? "bg-[#50698f]" : "bg-white"
        }`}
      >
        <h1
          className={`text-2xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-[#304463]"
          }`}
        >
          {isNewUser ? "Sign Up" : "Login"}
        </h1>

        <button
          onClick={handleGoogleLogin}
          className={`w-full py-2 px-4 rounded text-white font-medium mb-4 ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-[#304463] hover:bg-[#203344]"
          }`}
        >
          Sign in with Google
        </button>

        <hr className="my-4" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            isNewUser ? handleEmailSignUp() : handleEmailLogin();
          }}
          className="flex flex-col gap-4"
        >
          {isNewUser && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`py-2 px-3 rounded border focus:outline-none ${
                darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white"
              }`}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`py-2 px-3 rounded border focus:outline-none ${
              darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white"
            }`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`py-2 px-3 rounded border focus:outline-none ${
              darkMode ? "bg-gray-600 text-white border-gray-500" : "bg-white"
            }`}
          />
          <button
            type="submit"
            className={`py-2 px-4 rounded text-white font-medium ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-[#304463] hover:bg-[#203344]"
            }`}
          >
            {isNewUser ? "Sign Up with Email" : "Login with Email"}
          </button>
        </form>

        {feedbackMessage && (
          <p className="mt-4 text-sm text-red-500">{feedbackMessage}</p>
        )}

        <p className="mt-4 text-sm">
          {isNewUser ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsNewUser(!isNewUser)}
            className={`underline ${
              darkMode ? "text-gray-300 hover:text-gray-100" : "text-blue-600"
            }`}
          >
            {isNewUser ? "Login here" : "Sign up here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
