const https = require("https");
const express = require("express");
const fs = require("fs");
const socketIo = require("socket.io");
const corsAnywhere = require("cors-anywhere");
const app = express();
const cors = require("cors");

require("dotenv").config();

const { formatDate } = require("./Utils/formatDate");
const {
  fetchFilteredGraphData,
  fetchDevices,
  calculateAndEmitSpeed,
} = require("./DataHandlers/dataHandlers");

// Load SSL certificates for HTTPS
const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};
// Create an HTTPS server
const httpsServer = https.createServer(sslOptions, app);
let connectedClients = 0;

// Set up socket.io with HTTPS and CORS
const io = socketIo(httpsServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN, // Your client URL
    methods: ["GET", "POST"],
    credentials: true, // For cookie-based authentication
    allowedHeaders: [
      "Content-Type",
      "fiware-service",
      "fiware-servicepath",
      "Link",
      "Accept",
    ],
  },
  transports: ["websocket"], // Enforce WebSocket transport
  path: "/socket.io/",
});

// Enable CORS for all origins on Express
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "fiware-service",
      "fiware-servicepath",
      "Link",
      "Accept",
    ],
  })
);



// Log client connections and disconnections
io.on("connection", (socket) => {
  connectedClients++;
  console.log(`Number of clients: ${connectedClients}`);
  console.log(`New client connected: ${socket.id}`);
  io.emit("clientConnected", connectedClients);

  // User info object
  const userInfo = {
    userID: socket.id,
    userNumber: connectedClients,
    timeConnected: formatDate(new Date()),
  };
  socket.emit("userInfo", userInfo);

  let currentUseCaseValue = "All"; // Store current useCaseValue
  let refreshInterval = 5000;
  let fetchDevicesInterval = null;
  let speedCalculationInterval = null;
  // let userInfoInterval = null;

  // Handle selected device data requests
  socket.on("selectedDeviceData", (data) => {
    // console out with socket.id
    console.log(`Selected Device Data received from ${socket.id}:`, data);
    socket.emit("selectedDeviceData", data);
  });

  // Handle pinned attribute data requests
  socket.on("pinAttribute", (data) => {
    console.log(`Pinned attribute data received from ${socket.id}:`, data);
    socket.emit("pinnedAttribute", data);
  });

  // Handle use case data requests
  socket.on("useCaseData", (data) => {
    console.log(`Received use case from ${socket.id}:`, data.useCaseValue);
    currentUseCaseValue = data.useCaseValue;
    fetchDevices(socket, currentUseCaseValue);
  });

  // Handle refresh interval requests
  socket.on("refreshInterval", (data) => {
    console.log(`Received refresh interval from ${socket.id}:`, data);
    clearInterval(fetchDevicesInterval);
    clearInterval(speedCalculationInterval);
    fetchDevicesInterval = setInterval(() => {
      fetchDevices(socket, currentUseCaseValue);
    }, data.refreshInterval);
    speedCalculationInterval = setInterval(() => {
      calculateAndEmitSpeed(socket);
    }, data.refreshInterval);
  });

  // Handle graph filter data requests
  socket.on(
    "graphFilterData",
    async ({
      deviceID,
      deviceType,
      attributeKey,
      startDateTime,
      endDateTime,
      lastX,
      color,
    }) => {
      console.log(`Received filter data from ${socket.id}:`, {
        deviceID,
        deviceType,
        attributeKey,
        startDateTime,
        endDateTime,
        lastX,
        color,
      });

      try {
        const fetchedData = await fetchFilteredGraphData(
          deviceID,
          deviceType,
          new Date(startDateTime),
          new Date(endDateTime),
          lastX
        );

        const times = fetchedData.index;
        const attributes = fetchedData.attributes;
        const requestedAttribute = attributes.find(
          (attr) => attr.attrName === attributeKey
        );

        const attributeData = requestedAttribute.values;
        const attributeTimes = times;
        const mappedValues = attributeData.map((value, index) => ({
          value,
          timestamp: attributeTimes[index],
        }));

        const requestedData = {
          values: mappedValues,
          created: formatDate(new Date()),
          deviceID: deviceID,
          attributeKey: requestedAttribute.attrName,
          lastX: lastX,
          color: color,
        };

        socket.emit("graphFilteredData", requestedData);
      } catch (error) {
        console.error("Error fetching filtered graph data:", error.message);
        socket.emit("error", {
          message: "Failed to fetch filtered graph data.",
        });
      }
    }
  );

  // Interval for fetching devices
  fetchDevicesInterval = setInterval(() => {
    fetchDevices(socket, currentUseCaseValue);
  }, refreshInterval);

  // Interval for calculating and emitting speed
  speedCalculationInterval = setInterval(() => {
    calculateAndEmitSpeed(socket);
  }, refreshInterval);

  // userInfoInterval = setInterval(() => {
  //   socket.emit("userInfo", userInfo);
  // }, 60000);

  socket.on("disconnect", () => {
    connectedClients--;
    console.log(`Number of clients: ${connectedClients}`);
    io.emit("clientDisconnected", connectedClients);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Set up CORS Anywhere for proxied requests
const corsProxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: [],
  removeHeaders: [],
});

// CORS proxy route
app.use("/cors-anywhere", (req, res) => {
  corsProxy.emit("request", req, res);
});

// Start the HTTPS server
const PORT = process.env.PORT || 5000;
httpsServer.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server running on https://robomo.hopto.org:${PORT}`);
});

// Graceful Shutdown Handler
const shutdown = () => {
  console.log("Gracefully shutting down...");
  clearInterval(fetchDevicesInterval);
  clearInterval(speedCalculationInterval);
  // clearInterval(userInfoInterval);

  io.close(() => {
    console.log("WebSocket server closed");
    httpsServer.close(() => {
      console.log("HTTPS server closed");
      process.exit(0); // Exit the process
    });
  });
};

// Handle termination signals
process.on("SIGINT", shutdown); // For Ctrl+C
process.on("SIGTERM", shutdown); // For system termination signals 
