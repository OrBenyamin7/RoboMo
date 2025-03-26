import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  YAxis,
  XAxis,
  Area,
  Tooltip,
} from "recharts";
import { parseAttributeKey } from "../../Utils/StringParser";

// Custom tooltip component with formatted timestamp
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { value, timestamp } = payload[0].payload; // Extract value and timestamp

    // Format timestamp
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "/"); // "yy/mm/dd"
    const formattedTime = date.toLocaleTimeString("en-GB", { hour12: false }); // "h:m:s"

    return (
      <div className="bg-white border ml-10 mr-10 p-2 rounded shadow-md opacity-90">
        <p>{`${formattedDate} ${formattedTime}`}</p>
        <p>{`${value}`}</p>
      </div>
    );
  }

  return null;
};

const DynamicLineChart = ({
  graphID,
  lastX,
  attributeKey,
  deviceID,
  created,
  values,
  color,
}) => {
  if (values.length === 0) {
    return null; // Return null if there is no data
  }

  // Calculate the minimum and maximum values
  const minValue = Math.min(...values.map((d) => d.value));
  const maxValue = Math.max(...values.map((d) => d.value));

  // Ensure there is a slight difference if minValue and maxValue are the same
  const adjustedMin = minValue === maxValue ? minValue - 1 : minValue;
  const adjustedMax = minValue === maxValue ? maxValue + 1 : maxValue;

  const dataToDisplay = values.slice(-lastX);

  const gradientId = `colorValue-${deviceID}-${graphID}`;
  const areaFillId = `areaFill-${deviceID}-${graphID}`;

  return (
    <div>
      <span className="font-mono rounded-full w-7 h-fit font-bold text-[#304463] items-center justify-center mr-2">{graphID + 1})</span>
      <span className="font-light mr-2">{deviceID}</span>
      <span className="color-[#304463] mr-2 whitespace-nowrap font-semibold">
        {parseAttributeKey(attributeKey).toUpperCase()} <br/ >
      </span>
      <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">
        Minium: {minValue}, Maximum: {maxValue}, {lastX} Values {}
      </span>
      <ResponsiveContainer width="100%" height={100} className="mt-3">
        <AreaChart data={dataToDisplay}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="1%" stopColor={color} stopOpacity={0} />
              <stop offset="30%" stopColor={color} stopOpacity={1} />
              <stop offset="70%" stopColor={color} stopOpacity={1} />
              <stop offset="99%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={areaFillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickLine={false} // Hides the default tick line
            axisLine={false} // Hides the axis line
            tickSize={2} // Set the size of the tick lines
            tick={{ stroke: "#e3e9ee", strokeWidth: 0.5, dy: 0 }} // Customize tick as a small vertical line
            tickFormatter={() => "|"} // Custom tick label to show just a vertical bar
            interval="preserveStartEnd"
          />
          <YAxis domain={[adjustedMin, adjustedMax]} hide={true} />
          {/* Custom Tooltip */}
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={`url(#${gradientId})`} // Use the unique gradient ID here
            fill={`url(#${areaFillId})`} // Use the unique gradient ID here
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-3">
        {created} {color}
      </p>
    </div>
  );
};

export default DynamicLineChart;
