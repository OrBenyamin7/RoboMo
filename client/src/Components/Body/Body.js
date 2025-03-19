import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import Device from "./Device/Device.js";
import DeviceNode from "./Device/DeviceNode.js";
import { AppDarkMode } from "../../App";
import { parseAttributeKey, parseAttributeID } from "../../Utils/StringParser";

import ServerSpeedWidget from "../Widgets/ServerSpeedWidget.js";
import ActiveDevicesWidget from "../Widgets/ActiveDevicesWidget.js";
import PinnedAttributeWidget from "../Widgets/PinnedAttributeWidget.js";
import ConnectedClientsWidget from "../Widgets/ConnectedClientsWidget.js";
import UserInfoWidget from "../Widgets/UserInfoWidget.js";
import DeviceCompareScreen from "./DeviceCompare.js";
import Config from "./Config.js";

// Initialize the WebSocket connection (replace with your server URL)
const socket = io("https://robomo.hopto.org:5000", {
  transports: ["websocket"],
});

// const socket = io("http://localhost:5000");

const Body = () => {
  const [devices, setDevices] = useState([]);
  const [deviceUseCases, setDeviceUseCases] = useState([]);
  const [visibleDevices, setVisibleDevices] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate] = useState(false);

  const darkMode = useContext(AppDarkMode);
  const mapRef = useRef();
  const [mapDimensions, setMapDimensions] = useState({ width: 1, height: 1 });

  useEffect(() => {
    // Listen for 'devices' events from the server
    socket.on("devices", (data) => {
      setDevices(data);
      // Automatically update the selected device data if it is still in the list
      if (selectedDevice) {
        const updatedDevice = data.find(
          (device) => device.id === selectedDevice.id
        );
        if (updatedDevice) {
          setSelectedDevice(updatedDevice);
        }
      }
    });

    // Listen for 'useCaseValues' events from the server
    socket.on("useCaseValues", (data) => {
      setDeviceUseCases(data);
    });
    
    // Cleanup on component unmount
    return () => {
      socket.off("devices");
    };
  }, [selectedDevice]);

  useEffect(() => {
    const updateMapDimensions = () => {
      if (mapRef.current) {
        const { width, height } = mapRef.current.getBoundingClientRect();
        setMapDimensions({ width, height });
      }
    };
    updateMapDimensions();
    window.addEventListener("resize", updateMapDimensions);
    return () => window.removeEventListener("resize", updateMapDimensions);
  }, []);

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  const onExpandCompare = () => {
    setExpanded(true);
  };

  const onToggleExpandCompare = () => {
    if (expanded) {
      console.log("Collapsing");
      // Trigger slide-out animation first
      setAnimate(true);
      setTimeout(() => {
        setExpanded(false);
        setAnimate(false);
      }, 200);
    } else {
      console.log("Expanding");
      setExpanded(true);
    }
  };

  useEffect(() => {
    setVisibleDevices((prev) => {
      const updatedVisibility = devices.reduce((acc, device) => {
        // Preserve the existing visibility state if it exists
        acc[device.id] = prev[device.id] === false ? false : true;
        return acc;
      }, {});
      return updatedVisibility;
    });
  }, [devices]);

  const handleVisibilityChange = (deviceId) => {
    setVisibleDevices((prev) => {
      const updatedVisibility = { ...prev }; // Copy the previous state
      updatedVisibility[deviceId] = !updatedVisibility[deviceId]; // Toggle visibility
      return updatedVisibility; // Return the updated state
    });
  };

  const positions = {
    0: [30, 90],
    1: [45, 80],
    2: [57, 8],
    3: [14, 80],
    4: [17, 90],
    5: [15, 60],
    6: [25, 75],
    7: [82, 76],
    8: [35, 60],
    9: [56, 66],
    10: [70, 75],
    11: [70, 60],
    12: [75, 60],
    13: [80, 60],
    14: [10, 25],
    15: [91, 60],
    16: [70, 15],
    17: [44, 44],
    18: [19, 34],
    19: [55, 25],
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <UserInfoWidget socket={socket} />
        <PinnedAttributeWidget socket={socket} devices={devices} />
        <ConnectedClientsWidget socket={socket} />
        <ActiveDevicesWidget devices={devices} />
        <ServerSpeedWidget socket={socket} />
      </div>

      <div className="flex flex-col md:flex-row h-[900px] gap-4 p-4">
        <div className="md:w-[50%]">
          <div
            className={`shadow-inner p-4 h-full ${
              darkMode ? "bg-[#304463] rounded" : "bg-gray-100 rounded"
            }`}
          >
            <div className="flex justify-between mb-3 items-center">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke="currentColor"
                  className="size-7 mr-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"
                  />
                </svg>

                <h1
                  className={`text-lg text-${
                    darkMode ? "[#ffffff]" : "[#304463]"
                  } font-bold`}
                >
                  DEVICES LIST
                </h1>
              </div>

              <button
                onClick={onToggleExpandCompare}
                className={`flex items-center gap-2 align-right h-fit transition duration-75 ease-in-out ${
                  darkMode
                    ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700"
                    : "text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"
                } rounded text-sm px-4 py-2`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  className="size-5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <line x1="4" y1="19" x2="20" y2="19" />{" "}
                  <polyline points="4 15 8 9 12 11 16 6 20 10" />
                </svg>
                <span>Compare</span>
              </button>
            </div>
            <div className="overflow-auto h-[530px]">
              <table className="table-fixed w-full">
                <thead className="">
                  <tr>
                    <th className="text-left w-[20px] p-1">#</th>
                    <th className="text-left w-[150px] p-1">ID</th>
                    <th className="text-left w-[150px] p-2">Type</th>
                    <th className="text-right p-1">Show </th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, index) => {
                    const isSelected = device === selectedDevice;
                    return (
                      <tr
                        key={device.id}
                        className="cursor-pointer border-t border-dashed h-[50px] border-gray-200 rounded-lg"
                        style={{
                          backgroundColor: isSelected ? "rgba(0,0,0,0.03)" : "",
                          borderLeft: isSelected ? "2px solid #304463" : "",
                        }}
                        onClick={() => handleDeviceClick(device)} // Triggered only when clicking outside the toggle
                      >
                        <td className="p-1 font-light">{index + 1}</td>
                        <td className="p-1 font-light">
                          {parseAttributeID(device.id)}
                        </td>
                        <td className="p-2">
                          {parseAttributeKey(device.type)}
                        </td>
                        <td className="p-1 w-fit text-right">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={visibleDevices[device.id] !== false} // Default to visible if not explicitly hidden
                              onChange={(e) => {
                                e.stopPropagation(); // Prevent the toggle click from triggering the row's onClick
                                handleVisibilityChange(device.id); // Toggle visibility
                              }}
                            />
                            <div className="relative w-11 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-5 after:transition-all peer-checked:bg-[#304463]"></div>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <hr className="w-[100%] h-1 mx-auto my-4 bg-gray-200 border-0 rounded dark:bg-gray-700"></hr>
            <Config socket={socket} deviceUseCases={deviceUseCases} />
          </div>
        </div>

        <div className="w-full">
          {expanded && (
            <div
              className={`absolute shadow-sm md:w-[930px] ${
                darkMode ? "bg-[#445672]" : "bg-gray-100"
              } bg-opacity-90 h-[868px] p-4 rounded overflow-auto z-10`}
              style={{
                animation: animate
                  ? "slideOut 0.2s ease-out forwards"
                  : "slideIn 0.2s ease-out forwards",
              }}
            >
              <DeviceCompareScreen
                socket={socket}
                onToggleExpand={onToggleExpandCompare}
              />
            </div>
          )}
          <div
            className={`relative h-full max-w-screen-md min-w-[900px] mx-auto ${
              darkMode ? "bg-[#304463] bg-mapDark" : "bg-white bg-map"
            } bg-contain bg-no-repeat bg-center`}
            ref={mapRef}
          >
            {devices.map((device, index) => {
              const position = positions[index] || [0, 0]; // Access position for the current index
              const isSelected = device === selectedDevice;

              return (
                <DeviceNode
                  key={device.id}
                  device={device}
                  index={index}
                  onClick={handleDeviceClick}
                  style={{
                    left: `${position[0]}%`, // Use percentage-based positions
                    top: `${position[1]}%`,
                    transform: "translate(-50%, -50%)", // Center the node
                    borderWidth: isSelected ? "0px" : "4px",
                    opacity: visibleDevices[device.id] ? "1" : "0.10",
                    pointerEvents: visibleDevices[device.id] ? "auto" : "none",
                    position: "absolute", // Absolute positioning inside the container
                    transition: "opacity 0.1s ease",
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-[50%]">
          <div
            className={`shadow-inner z-10 p-4 h-full ${
              darkMode ? "bg-[#304463] rounded" : "bg-gray-100 rounded"
            }`}
          >
            <div className="flex justify-between mb-3 items-center">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1"
                  stroke="currentColor"
                  className="size-7 mr-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                  />
                </svg>
                <h1
                  className={`text-lg text-${
                    darkMode ? "[#ffffff]" : "[#304463]"
                  } font-bold`}
                >
                  DEVICE ATTRIBUTES
                </h1>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className={`rounded text-sm px-4 py-2 ${
                  darkMode
                    ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600 focus:ring-gray-700"
                    : "text-gray-900 border border-gray-200 focus:outline-none hover:bg-white focus:ring-4 focus:ring-gray-100"
                }`}
                style={{
                  opacity: selectedDevice ? 1 : 0.35,
                  pointerEvents: selectedDevice === null ? "none" : "auto",
                  transition: "opacity 0.3s ease-in-out",
                }}
              >
                Close
              </button>
            </div>
            {selectedDevice ? (
              <Device
                socket={socket}
                onExpandCompare={onExpandCompare}
                device={selectedDevice}
              />
            ) : (
              <div className="w-full bg-gray-300 p-4 rounded shadow-inner opacity-80 flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                Select a device from the 'Devices list'
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Body;
