import React, { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import { Box, Card, Typography } from "@mui/material";

export default function StatisticsShowNumberCard(props) {
  return (
    <>
      <Card
        sx={{
          textAlign: "center",
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
          padding: 5,

          boxSizing: "content-box",
          maxHeight: 80,
        }}
      >
        {props.iconComponent}
        <CardHeader
          title={props.headerTitle}
          subheader={props.headerSubTitle}
        />
        <Box
          sx={{
            textAlign: "center",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" color="initial" component={"p"}>
            {props.value}
          </Typography>
        </Box>
      </Card>
    </>
  );
}
