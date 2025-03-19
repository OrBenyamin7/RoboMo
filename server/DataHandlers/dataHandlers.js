const axios = require("axios");
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
    // Create an HTTPS agent that trusts the self-signed certificate
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Allow self-signed certificates
    });

    // Construct the API URL dynamically based on the filter parameters
    const API_URL = `http://172.16.101.172:8668/v2/entities/urn:ngsi-ld:${deviceType}:${deviceID}?lastN=${lastX}&fromDate=${startDateTime.toISOString()}&toDate=${endDateTime.toISOString()}`;
    console.log("Fetching data from API:", API_URL);

    const response = await axios.get(
      `https://134.122.75.45:5000/cors-anywhere/${API_URL}`,
      {
        httpsAgent, // Use the custom agent
        headers: {
          Accept: "application/json",
          Link: '<http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
          "X-Requested-With": "XMLHttpRequest", // Add this header
          "fiware-service": "openiot",
          "fiware-servicepath": "/",
        },
        timeout: 30000, // Set timeout to 10 seconds
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Return the fetched data
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

// Function to fetch data from the API
const https = require("https");

const fetchDevices = async (socket, currentUseCaseValue) => {
  try {
    // Create an HTTPS agent that trusts the self-signed certificate
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Allow self-signed certificates
    });

    // API URL (using the CORS proxy)
    const API_URL =
      "http://172.16.101.172:1026/ngsi-ld/v1/entities/?local=true";

    const response = await axios.get(
      `https://134.122.75.45:5000/cors-anywhere/${API_URL}`,
      {
        httpsAgent, // Use the custom agent
        headers: {
          Accept: "application/json",
          Link: '<http://context/ngsi-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
          "X-Requested-With": "XMLHttpRequest", // Add this header
          "fiware-service": "openiot",
          "fiware-servicepath": "/",
        },
        timeout: 30000, // Set timeout to 10 seconds
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Extract the useCases attribute from the response data
    const useCases = response.data
      .map((device) => device.useCases)
      .filter((useCase) => useCase !== undefined);
    const useCaseValues = Array.from(
      new Set(useCases.map((useCase) => useCase.value))
    );
    useCaseValues.unshift("All");
    socket.emit("useCaseValues", useCaseValues);

    // Filter devices based on the useCases attribute
    let filteredData = response.data;
    if (currentUseCaseValue !== "All") {
      filteredData = response.data.filter(
        (device) =>
          device.useCases && device.useCases.value === currentUseCaseValue
      );
    }

    // Cache the filtered data
    cachedData = filteredData;
    const dataSize = JSON.stringify(cachedData).length; // Calculate the size of the data
    totalDataSent += dataSize; // Increment total data sent

    socket.emit("devices", filteredData); // Broadcast the data to all connected clients
    // console.log(
    //   "Data fetched from external API and broadcasted to clients.",
    //   filteredData.length
    // );
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
  const transferSpeed = totalDataSent / 5; // Calculate speed (data per second)
  socket.emit("transferSpeed", transferSpeed);
  totalDataSent = 0; // Reset total data sent
};

module.exports = {
  fetchFilteredGraphData,
  fetchDevices,
  calculateAndEmitSpeed,
};
