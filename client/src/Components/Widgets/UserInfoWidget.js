import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

const UserInfoWidget = ({ socket }) => {
  const [colors, setColors] = useState([]);
  const [userID, setUserID] = useState();
  const [userNumber, setUserNumber] = useState();
  const [timeConnected, setTimeConnected] = useState();
  const [userName, setUserName] = useState(""); // State to store the user's name

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  useEffect(() => {
    // Listen for changes to the authenticated user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserName(currentUser.displayName || "Anonymous"); // Use displayName or fallback to "Anonymous"
      } else {
        setUserName(""); // No user signed in
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for the filtered data from the server
  useEffect(() => {
    socket.on("userInfo", (data) => {
      setUserID(data.userID);
      setUserNumber(data.userNumber);
      setTimeConnected(data.timeConnected);
    });

    if (socket.id) {
      // Generate colors based on ASCII values of characters in the socket ID
      const generateColors = () => {
        return Array.from(socket.id).map((char) => {
          const asciiValue = char.charCodeAt(0); // Get ASCII value of the character

          // Generate a color based on the ASCII value
          const red = (asciiValue * 3) % 256; // Modulo ensures it wraps within 0-255
          const green = (asciiValue * 5) % 256;
          const blue = (asciiValue * 7) % 256;

          return `rgb(${red}, ${green}, ${255})`;
        });
      };
      setColors(generateColors());
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off("userInfo");
    };
  }, [socket, socket.id]);

  return (
    <div className="bg-gradient-to-r from-blue-100 to-sky-200 p-4 w-full md:w-[25%] flex flex-col shadow rounded h-auto">
      <div className="flex gap-4">
        <div className="absolute grid grid-cols-5 gap-0">
          {colors.slice(0, 20).map((color, index) => (
            <div
              key={index}
              style={{
                backgroundColor: color,
                width: "9px",
                height: "9px",
                opacity: 0.75,
              }}
            ></div>
          ))}
        </div>

        <p className="ml-16 leading-none absolute flex flex-col">
          <div className="flex items-center gap-2 justify-between items-top w-full">
          <span className="text-s">{userName ? `Hello, ${userName}` : "Hello, Guest"}</span>
          <button onClick={handleLogout} className="text-xs ml-2 bg-[#304463] text-white px-2 py-1 rounded">
            Logout
          </button>
          </div>
          <span className="text-xs opacity-35">WSID: {socket.id}</span>
        </p>
        {socket.id && (
          <>
            <div className="absolute top-[110px] left-[70px] -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
            <div className="absolute top-[110px] left-[70px] -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfoWidget;
