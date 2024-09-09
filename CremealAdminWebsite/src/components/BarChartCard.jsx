import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Card, CardHeader } from "@mui/material";

const chartSetting = {
  xAxis: [
    {
      label: "Count in person",
    },
  ],

  height: 400,
};

export default function HorizontalBars({
  data = [],
  headerTitle = "",
  headerSubTitle = "",
}) {
  return (
    <Card
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader title={headerTitle} subheader={headerSubTitle} />
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <BarChart
          dataset={data}
          yAxis={[{ scaleType: "band", dataKey: "label" }]}
          series={[{ dataKey: "value", label: "Count" }]}
          layout="horizontal"
          {...chartSetting}
          sx={{
            width: "100%",
            height: "100%",
            [`& .barChart-label`]: {
              fill: "black",
              fontWeight: "bold",
              fontSize: 14,
            },
          }}
        />
      </div>
    </Card>
  );
}
