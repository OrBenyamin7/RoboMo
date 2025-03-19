import React, { useContext, useState, useEffect, useRef } from "react";
import DeviceAttribute from "./DeviceAttribute";
import BarChart from "../../Graphs/BarChart";
import { AppDarkMode } from "../../../App";
import { parseAttributeID } from "../../../Utils/StringParser";
import { isInt, isFloat } from "../../../Utils/NumParser";

const Device = ({ socket, onExpandCompare, device }) => {
  const [openMenuKey, setOpenMenuKey] = useState(null); // Track the open menu
  const [showScrollIndicator, setShowScrollIndicator] = useState(false); // Track scroll indicator visibility
  const scrollableRef = useRef(null); // Ref to the scrollable container
  const darkMode = useContext(AppDarkMode);

  const handleMenuToggle = (key) => {
    setOpenMenuKey(openMenuKey === key ? null : key); // Toggle the menu
  };

  // Monitor scroll and show/hide indicator
  useEffect(() => {
    const handleScroll = () => {
      const element = scrollableRef.current;
      if (!element) return;

      const isScrollable = element.scrollHeight > element.clientHeight; // Check if there's overflow
      const isAtBottom =
        element.scrollHeight - element.scrollTop === element.clientHeight; // Check if at bottom

      setShowScrollIndicator(isScrollable && !isAtBottom);
    };

    const element = scrollableRef.current;
    if (element) {
      handleScroll(); // Check on load
      element.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Prepare data for the chart
  const chartData = Object.keys(device)
    .filter((key) => key.toLowerCase().includes("value"))
    .splice(0, 5)
    .map((key) => {
      return {
        name: key,
        value: JSON.parse(JSON.stringify(device[key])).value,
      };
    })
    .filter((item) => item !== null);

  return (
    <div className="z-10 flex flex-col gap-2 h-full h-[800px] relative">
      {/* Attributes Section */}
      <div
        ref={scrollableRef}
        className="overflow-auto rounded md:h-[60%] relative"
      >
        <div className="grid grid-cols-2 gap-1 auto-rows-auto">
          <DeviceAttribute
            key={"type"}
            socket={socket} // Pass the socket to the attribute
            attributeKey={"Device"}
            attributeValue={[parseAttributeID(device.id), " ", device.type]}
            isMenuOpen={openMenuKey === "type"}
            onToggleMenu={() => handleMenuToggle("type")}
            onCloseMenu={() => setOpenMenuKey(null)}
          />
          {Object.keys(device)
            .sort((a, b) => {
              // Ensure 'image' is always last in the sorted order
              if (a === "image") return 1; // Put 'a' after 'b'
              if (b === "image") return -1; // Put 'b' after 'a'
              return a.localeCompare(b); // Otherwise, compare normally
            })
            .map((key) => {
              const value = JSON.parse(JSON.stringify(device[key])).value;
              const isValidValue = isInt(value) || isFloat(value);
              ////////
              if (key === "type" || key === "id" || key === "image") return null; // Skip the type and id attribute
              ////////
              return (
                <DeviceAttribute
                  key={key}
                  socket={socket} // Pass the socket to each attribute
                  deviceID={parseAttributeID(device.id)}
                  deviceType={device.type}
                  attributeKey={key}
                  attributeType={JSON.parse(JSON.stringify(device[key])).type}
                  attributeValue={
                    JSON.parse(JSON.stringify(device[key])).object ||
                    JSON.parse(JSON.stringify(device[key])).value
                  }
                  isMenuOpen={openMenuKey === key}
                  onToggleMenu={() => handleMenuToggle(key)}
                  onCloseMenu={() => setOpenMenuKey(null)}
                  onExpandCompare={onExpandCompare}
                  isValidValue={isValidValue}
                />
              );
            })}
        </div>
      </div>
      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <>
          <div className="absolute top-[475px] left-1 right-1 h-7 bg-gradient-to-t from-gray-200 to-transparent"></div>
          
        </>

        // <div className="absolute top-[475px] right-[-9px] text-sky-400 animate-bounce">
        //   <svg
        //     xmlns="http://www.w3.org/2000/svg"
        //     fill="none"
        //     viewBox="0 0 24 24"
        //     stroke-width="1.5"
        //     stroke="currentColor"
        //     class="size-6"
        //   >
        //     <path
        //       stroke-linecap="round"
        //       stroke-linejoin="round"
        //       d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
        //     />
        //   </svg>
        // </div>
      )}
      <hr className="w-[400px] h-1 mx-auto my-4 bg-gray-200 border-0 rounded md:my-5 dark:bg-gray-700"></hr>
      {/* Charts Section */}
      {device.type.includes("Sensor") && (
        <div className="self-stretch md:h-[50px] flex flex-row ml-[-25px]">
          {chartData.map((data, index) => (
            <BarChart key={index} data={data} darkMode={darkMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Device;
