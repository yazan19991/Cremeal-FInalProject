import React, { useContext, useState, useEffect, useRef } from "react";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Typography,
  TextField,
  Container,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { UserContext } from "../App";
import { useUpdateUserCoins, useUsers } from "../assets/api/apiFunctions";
import { SplitText } from "./SplitText ";

const columnHelper = createMRTColumnHelper();

const UsersTable = ({ setShowForm, setUsersSelected }) => {
  const { token } = useContext(UserContext);
  const { data = [], isLoading, refetch } = useUsers(token);
  const { mutate: updateUserCoins } = useUpdateUserCoins(token);

  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [tableData, setTableData] = useState([]);
  const containerRef = useRef(null);

  // Refetch data when token is accessible
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  useEffect(() => {
    setTableData(data); // Initialize table data when data is loaded
  }, [data]);

  const handleCellEdit = async (updatedCell, rowIndex) => {
    const updatedValue = updatedCell.value;

    try {
      updateUserCoins({
        id: tableData[rowIndex].id,
        coins: updatedValue,
      });
      setTableData((prevData) =>
        prevData.map((row, index) =>
          index === rowIndex ? { ...row, coins: updatedValue } : row
        )
      );
    } catch (error) {
      console.error("Failed to update user coins:", error);
    } finally {
      setEditingCell(null);
    }
  };

  const handleDoubleClick = (cell, rowIndex) => {
    setEditingCell({ cell, rowIndex });
    setTempValue(cell.getValue() ?? 0);
  };

  const handleBlur = () => {
    const updatedValue = parseInt(tempValue, 10);
    if (!isNaN(updatedValue) && editingCell) {
      handleCellEdit(
        { ...editingCell.cell, value: updatedValue },
        editingCell.rowIndex
      );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleBlur();
    }
  };

  const handleSaveClick = () => {
    const updatedValue = parseInt(tempValue, 10);
    if (!isNaN(updatedValue) && editingCell) {
      handleCellEdit(
        { ...editingCell.cell, value: updatedValue },
        editingCell.rowIndex
      );
    }
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      if (editingCell) {
        handleBlur();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell]);

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      size: 40,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 120,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      size: 200,
    }),
    columnHelper.accessor("coins", {
      header: "Coins",
      size: 150,
      Cell: ({ cell, row }) =>
        editingCell?.rowIndex === row.index ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              inputProps={{ "aria-label": "coins" }}
              sx={{ mr: 1 }}
            />
            <Button variant="contained" onClick={handleSaveClick}>
              Save
            </Button>
          </Box>
        ) : (
          <Typography
            variant="body1"
            onDoubleClick={() => handleDoubleClick(cell, row.index)}
          >
            {cell.getValue() ?? 0}
          </Typography>
        ),
    }),
  ];

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableRowSelection: true,
    selectAllMode: "page",
    enableBatchRowSelection: true,
    rowPinningDisplayMode: "select-sticky",
    columnFilterDisplayMode: "popover",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    muiPaginationProps: ({ table }) => ({
      rowsPerPageOptions: [
        {
          label: "5",
          value: 5,
        },
        {
          label: "8",
          value: 8,
        },
      ],
      showRowsPerPage: true,
    }),
    renderTopToolbarCustomActions: ({ table }) => (
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
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
    renderBottomToolbarCustomActions: ({ table }) => (
      <Button
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        onClick={() => {
          setShowForm(true);
          setUsersSelected(
            table
              .getSelectedRowModel()
              .rows.map((value) => value.original.email)
          );
        }}
      >
        Send Email to Selected Users
      </Button>
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
        text="Users table"
        className="custom-class"
        delay={50}
        style={{
          fontWeight: "700",
          fontSize: 50,
          color: "white",
        }}
      />
      <div ref={containerRef} style={{ padding: 50, width: "100%" }}>
        <MaterialReactTable table={table} />
      </div>
    </Container>
  );
};

export default UsersTable;
