import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { UserContext } from "../App";
import {
  useReligions,
  useInsertNewReligion,
  useDeleteReligion,
} from "../assets/api/apiFunctions";
import { useNavigate } from "react-router-dom";
import { SplitText } from "../components/SplitText ";

const columnHelper = createMRTColumnHelper();

const ReligionsTable = () => {
  const { token, setToken } = useContext(UserContext);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [newReligionTitle, setNewReligionTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Initialize token
  useEffect(() => {
    const storedToken = sessionStorage.getItem("AdminToken");
    if (storedToken) {
      setToken(storedToken);
      setIsTokenLoaded(true);
    } else {
      navigate("/login");
    }
  }, [navigate, setToken]);

  // Fetch data once token is loaded
  const {
    data: dataReligions = [],
    isLoading: isLoadingReligions,
    refetch,
  } = useReligions(token, { enabled: isTokenLoaded && !!token });
  const insertReligionMutation = useInsertNewReligion(token);
  const deleteReligionMutation = useDeleteReligion(token);

  useEffect(() => {
    if (isTokenLoaded) {
      setLoading(true);
      refetch().finally(() => setLoading(false));
    }
  }, [isTokenLoaded, refetch]);

  useEffect(() => {
    if (!isLoadingReligions && !loading) {
      setTableData(dataReligions);
    }
  }, [dataReligions, isLoadingReligions, loading]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        size: 40,
        enableEditing: false,
      }),
      columnHelper.accessor("title", {
        header: "Title",
        size: 120,
        enableEditing: true,
      }),
    ],
    []
  );

  const csvConfig = useMemo(
    () =>
      mkConfig({
        fieldSeparator: ",",
        decimalSeparator: ".",
        useKeysAsHeaders: true,
      }),
    []
  );

  const handleExportData = useCallback(() => {
    const csv = generateCsv(csvConfig)(tableData);
    download(csvConfig)(csv);
  }, [csvConfig, tableData]);

  const handleUpdate = useCallback(
    async (exitEditingMode) => {
      try {
        exitEditingMode.exitEditingMode();
        refetch(); // Refetch data to reflect changes
      } catch (error) {
        console.error("Error updating religion:", error);
      }
    },
    [refetch]
  );

  const handleAddNewRowOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleAddNewRowClose = useCallback(() => {
    setOpen(false);
    setNewReligionTitle(""); // Clear input field on close
    setError(null);
  }, []);

  const handleAddNewRow = useCallback(async () => {
    if (!newReligionTitle.trim()) {
      setError("Title is required");
      return;
    }
    try {
      await insertReligionMutation.mutateAsync(newReligionTitle);
      refetch();
      handleAddNewRowClose();
    } catch (error) {
      console.error("Error adding new religion:", error);
      setError("Failed to add new religion");
    }
  }, [newReligionTitle, insertReligionMutation, refetch, handleAddNewRowClose]);

  const handleDeleteRows = useCallback(async () => {
    try {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);
      const successfulDeletions = [];

      const deletionPromises = selectedRows.map(async (id) => {
        const success = await deleteReligionMutation.mutateAsync(id);
        if (success) {
          successfulDeletions.push(id);
        }
      });

      await Promise.all(deletionPromises);

      if (successfulDeletions.length > 0) {
        setTableData((prevTableData) =>
          prevTableData.filter((row) => !successfulDeletions.includes(row.id))
        );
      }

      refetch();
    } catch (error) {
      console.error("Error deleting allergens:", error);
      setError("Failed to delete selected allergens");
    }
  }, [deleteReligionMutation, refetch, setTableData]);

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
    manualPagination: false,
    muiPaginationProps: ({ table }) => ({
      rowsPerPageOptions: [],
      showRowsPerPage: false,
    }),
    renderTopToolbarCustomActions: useCallback(
      ({ table }) => (
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
          <Button onClick={handleAddNewRowOpen} startIcon={<AddIcon />}>
            Add New Religion
          </Button>
          <Button
            disabled={table.getRowModel().rows.length === 0}
            onClick={handleDeleteRows}
            startIcon={<DeleteIcon />}
            color="error"
          >
            Delete Selected Rows
          </Button>
        </Box>
      ),
      [handleExportData, handleAddNewRowOpen, handleDeleteRows]
    ),
  });

  if (!isTokenLoaded || loading) {
    return (
      <Backdrop open={true}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (isLoadingReligions) {
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
        text="Religions Table"
        className="custom-class"
        delay={50}
        style={{ fontWeight: "700", fontSize: 50, color: "white" }}
      />
      <div ref={containerRef} style={{ padding: 50, width: "100%" }}>
        <MaterialReactTable table={table} />
      </div>

      <Dialog open={open} onClose={handleAddNewRowClose}>
        <DialogTitle>Add New Religion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newReligionTitle}
            onChange={(e) => setNewReligionTitle(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") handleAddNewRow();
            }}
            error={Boolean(error)}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddNewRowClose}>Cancel</Button>
          <Button onClick={handleAddNewRow}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReligionsTable;
