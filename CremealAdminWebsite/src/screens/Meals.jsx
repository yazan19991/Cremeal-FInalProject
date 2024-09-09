import React, { useContext, useEffect, useRef, useState } from "react";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { UserContext } from "../App"; // Adjust or remove if not needed
import { useRecipes } from "../assets/api/apiFunctions"; // Adjust this import based on your API function
import { SplitText } from "../components/SplitText ";

const columnHelper = createMRTColumnHelper();

const RecipeTable = () => {
  const { token } = useContext(UserContext);
  const { data = [], isLoading } = useRecipes(token);

  const containerRef = useRef(null);

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      size: 40,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
    }),
    columnHelper.accessor("imageLink", {
      header: "Image",
      size: 200,
      Cell: ({ cell }) => (
        <img
          src={cell.getValue()}
          alt="Recipe"
          style={{ width: "100px", height: "auto" }}
        />
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 250,
    }),
    columnHelper.accessor("cookingTime", {
      header: "Cooking Time (mins)",
      size: 150,
    }),
    columnHelper.accessor("ingredients", {
      header: "Ingredients",
      size: 200,
    }),
    columnHelper.accessor("instructions", {
      header: "Instructions",
      size: 300,
    }),
    columnHelper.accessor("difficulty", {
      header: "Difficulty",
      size: 100,
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: false,
    enableRowActions: false,

    renderTopToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          padding: "8px",
          flexWrap: "wrap",
        }}
      >
        <Button onClick={handleExportData} startIcon={<FileDownloadIcon />}>
          Export All Data
        </Button>
      </Box>
    ),
  });

  if (isLoading) {
    return (
      <Backdrop open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <div ref={containerRef} style={{ padding: 50 }}>
      <MaterialReactTable table={table} />
    </div>
  );
};

export default RecipeTable;
