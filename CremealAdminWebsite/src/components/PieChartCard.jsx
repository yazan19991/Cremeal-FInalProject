import React from "react";
import { Card, CardHeader } from "@mui/material";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts";

export default function PieChartCard({
  data = [],
  headerTitle,
  headerSubTitle,
}) {
  console.log(data);

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
        }}
      >
        <PieChart
          series={[
            {
              data: data,
              arcLabel: (item) => `${item.label.charAt(0)}`,
              highlightScope: { faded: "global", highlighted: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              outerRadius: 80,
              labelPosition: "outside",
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: "black",
              fontWeight: "bold",
              fontSize: 14,
            },
          }}
          width={500}
          height={400}
        />
      </div>
    </Card>
  );
}
