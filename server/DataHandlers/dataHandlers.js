const axios = require("axios");
require("dotenv").config();
const https = require("https");

let cachedData = null;
let totalDataSent = 0; // Track total data sent for speed calculation

// Function to fetch filtered graph data from the API based on filter parameters
const fetchFilteredGraphData = async (
  deviceID,
  deviceType,
  startDateTime,
  endDateTime,
  lastX
) => {
  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    // Construct the API URL dynamically
    const API_URL = `${process.env.API_BASE_URL}/urn:ngsi-ld:${deviceType}:${deviceID}?lastN=${lastX}&fromDate=${startDateTime.toISOString()}&toDate=${endDateTime.toISOString()}`;
    console.log("Fetching data from API:", API_URL);

    const response = await axios.get(
      `${process.env.CORS_PROXY_URL}/${API_URL}`,
      {
        httpsAgent,
        headers: {
          Accept: "application/json",
          Link: '<http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
          "X-Requested-With": "XMLHttpRequest",
          "fiware-service": process.env.FIWARE_SERVICE,
          "fiware-servicepath": process.env.FIWARE_SERVICE_PATH,
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching filtered graph data:", {
      message: error.message,
      config: error.config,
      code: error.code,
      response: error.response
        ? {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          }
        : "No response",
    });
    throw new Error("Failed to fetch filtered graph data.");
  }
};

// Function to fetch device data
const fetchDevices = async (socket, currentUseCaseValue) => {
  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    const API_URL = process.env.CONTEXT_BROKER_URL;

    const response = await axios.get(
      `${process.env.CORS_PROXY_URL}/${API_URL}`,
      {
        httpsAgent,
        headers: {
          Accept: "application/json",
          Link: '<http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
          "X-Requested-With": "XMLHttpRequest",
          "fiware-service": process.env.FIWARE_SERVICE,
          "fiware-servicepath": process.env.FIWARE_SERVICE_PATH,
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const useCases = response.data
      .map((device) => device.useCases)
      .filter((useCase) => useCase !== undefined);
    const useCaseValues = Array.from(
      new Set(useCases.map((useCase) => useCase.value))
    );
    useCaseValues.unshift("All");
    socket.emit("useCaseValues", useCaseValues);

    let filteredData = response.data;
    if (currentUseCaseValue !== "All") {
      filteredData = response.data.filter(
        (device) =>
          device.useCases && device.useCases.value === currentUseCaseValue
      );
    }

    cachedData = filteredData;
    const dataSize = JSON.stringify(cachedData).length;
    totalDataSent += dataSize;

    socket.emit("devices", filteredData);
  } catch (error) {
    console.error("Error fetching data from external API:", {
      message: error.message,
      config: error.config,
      code: error.code,
      response: error.response
        ? {
            status: error.response.status,
            headers: error.response.headers,
            data: error.response.data,
          }
        : "No response",
    });
  }
};

// Function to calculate and emit transfer speed
const calculateAndEmitSpeed = (socket) => {
  const transferSpeed = totalDataSent / 5;
  socket.emit("transferSpeed", transferSpeed);
  totalDataSent = 0;
};

module.exports = {
  fetchFilteredGraphData,
  fetchDevices,
  calculateAndEmitSpeed,
};
