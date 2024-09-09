import React, { useContext, useRef } from "react";
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
import { useGetAllPlans, useUpdatePlan } from "../assets/api/apiFunctions";
import { SplitText } from "../components/SplitText ";

const columnHelper = createMRTColumnHelper();

const DealsTable = () => {
  const { token } = useContext(UserContext);
  const { data = [], isLoading } = useGetAllPlans(token);
  const updateDealMutation = useUpdatePlan(token);

  const containerRef = useRef(null);

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      size: 40,
      enableEditing: false,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
      enableEditing: true,
    }),
    columnHelper.accessor("coins", {
      header: "Coins",
      size: 100,
      enableEditing: true,
    }),
    columnHelper.accessor("price", {
      header: "Price ($)",
      size: 100,
      enableEditing: true,
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

  const handleUpdate = async (exitEditingMode) => {
    try {
      console.log(exitEditingMode.values);
      await updateDealMutation.mutateAsync(exitEditingMode.values);
      exitEditingMode.exitEditingMode();
    } catch (error) {
      console.error("Error updating deal:", error);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: false,
    enableRowActions: false,
    enableEditing: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    manualPagination: false,
    muiPaginationProps: ({ table }) => ({
      rowsPerPageOptions: [],
      showRowsPerPage: false,
    }),
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
    onEditingRowSave: (exitEditingMode) => handleUpdate(exitEditingMode),
  });

  if (isLoading) {
    return (
      <Backdrop open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: `80vh`,
      }}
    >
      <SplitText
        text="Plans table"
        className="custom-class"
        delay={50}
        style={{ fontWeight: "700", fontSize: 50, color: "white" }}
      />
      <div ref={containerRef} style={{ padding: 50, width: "100%" }}>
        <MaterialReactTable table={table} />
      </div>
    </Container>
  );
};

export default DealsTable;
