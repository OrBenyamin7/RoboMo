import React, { useEffect, useState, useContext } from "react";
import { AppDarkMode } from "../../App";

const Config = ({ socket, deviceUseCases }) => {
  const darkMode = useContext(AppDarkMode);

  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [useCaseValue, setUseCaseValue] = useState('All');
  const defaultRefreshInterval = 1000;

  const getUseCase = (e) => {
    const newUseCaseValue = e.target.value;
    setUseCaseValue(newUseCaseValue);
    socket.emit("useCaseData", {
      useCaseValue: newUseCaseValue,
    });
  };

  const applyRefreshInterval = () => {
    socket.emit("refreshInterval", {
      refreshInterval: refreshInterval,
    });
  };

  const resetRefreshInterval = () => {
    setRefreshInterval(defaultRefreshInterval);
    socket.emit("refreshInterval", {
      refreshInterval: defaultRefreshInterval,
    });
  };

  // listen to the refreshInterval from the server
  useEffect(() => {
    socket.on("refreshInterval", (data) => {
      console.log(
        "Received refresh interval from server:",
        data.refreshInterval
      );
      setRefreshInterval(data.refreshInterval);
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-top">
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
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          <h1
            className={`text-lg text-${
              darkMode ? "[#ffffff]" : "[#304463]"
            } font-bold`}
          >
            CONFIGURATION
          </h1>
        </div>

        <span
          className={`text-xs ${darkMode ? "text-black" : "text-gray-500"}`}
        >
          {socket.id}
        </span>
      </div>
      <div
        className={`rounded w-[100%] p-4 ${
          darkMode ? "bg-[#50698f]" : "bg-white"
        } shadow-md`}
      >
        <div
          className="grid grid-rows-3 gap-4"
          style={{ gridTemplateColumns: "100px 100px" }}
        >
          {/* Label Column */}
          <div className="flex items-center">
            <label>Use Case</label>
          </div>
          {/* Input Column */}
          <div className="flex items-center">
            <select
              value={useCaseValue}
              onChange={getUseCase}
              className="border p-1 rounded w-[200px] focus:outline-none text-black"
            >
              {deviceUseCases.map((option, index) => (
                <option key={index} value={option} className="bg-gray-100 text-black">
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Label for Refresh Time */}
          <div className="flex items-center">
            <label>Refresh Time</label>
          </div>
          {/* Input for Refresh Time */}
          <div className="flex items-center">
            <input
              type="number"
              className="border p-1 rounded w-[80px] focus:outline-none text-black"
              placeholder="1000"
              value={refreshInterval}
              onInput={(e) => setRefreshInterval(e.target.value)}
              step={refreshInterval <= 200 ? 100 : 1000}
            />
            <label className="ml-2 text-sm text-gray-500">ms</label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={applyRefreshInterval}
              className={`rounded mr-2 text-sm px-4 py-2 ${
                darkMode
                  ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600"
                  : "text-gray-900 border border-gray-200 focus:outline-none hover:border-gray-300"
              }`}
            >
              Apply
            </button>
            <button
              onClick={resetRefreshInterval}
              className={`rounded text-sm px-4 py-2 ${
                darkMode
                  ? "bg-[#50698f] text-white border-gray-600 hover:bg-gray-700 hover:border-gray-600"
                  : "text-gray-900 border border-gray-200 focus:outline-none hover:border-gray-300"
              }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
