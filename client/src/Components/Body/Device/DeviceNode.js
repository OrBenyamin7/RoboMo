import React from "react";

const DeviceNode = ({ device, index, onClick, style }) => {
  return (
    <div
      onClick={() => onClick(device)}
      className="cursor-pointer"
      style={{
        position: 'absolute',
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: "#304463",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        ...style,
      }}
    >
      {index + 1}
    </div>
  );
};

export default DeviceNode;
