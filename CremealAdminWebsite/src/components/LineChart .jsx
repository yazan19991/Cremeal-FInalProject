import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Dot } from "recharts";

const CustomDot = (props) => {
  const { cx, cy, fill, stroke, payload } = props;
  return (
    <Dot cx={cx} cy={cy} r={5} fill={fill} stroke={stroke} strokeWidth={2} />
  );
};

const LineChartComponent = ({ data }) => {
  return (
    <LineChart
      width={500}
      height={300}
      data={data}
      margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
    >
      <Tooltip />
      <Line
        type="monotone"
        dataKey="amount"
        stroke="#4caf50"
        strokeWidth={2}
        dot={<CustomDot />} // Use custom dot to make points visible
      />
      <XAxis dataKey="date" hide={true} />
      <YAxis hide={true} />
    </LineChart>
  );
};

export default LineChartComponent;
