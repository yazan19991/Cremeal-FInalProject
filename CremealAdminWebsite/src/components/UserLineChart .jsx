import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Container, Typography } from "@mui/material";

export const processUsersData = (data) => {
  const counts = {};

  data.forEach((item) => {
    const date = new Date(item.created);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;

    counts[yearMonth] = (counts[yearMonth] || 0) + 1;
  });

  const result = [];
  for (const [key, value] of Object.entries(counts)) {
    const [year, month] = key.split("-");
    result.push({ month: `${year}-${month.padStart(2, "0")}`, count: value });
  }

  // Ensure data starts from January 2023
  const startYear = 2023;
  const startMonth = 1;
  let currentMonth = new Date(startYear, startMonth - 1);

  while (currentMonth <= new Date()) {
    const formattedMonth = `${currentMonth.getFullYear()}-${(
      currentMonth.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
    if (!result.find((r) => r.month === formattedMonth)) {
      result.push({ month: formattedMonth, count: 0 });
    }
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return result.sort((a, b) => new Date(a.month) - new Date(b.month));
};

const UserLineChart = ({ data }) => {
  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        User Creation Over Time
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={(tick) =>
              `${tick.split("-")[0]}-${tick.split("-")[1]}`
            }
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default UserLineChart;
