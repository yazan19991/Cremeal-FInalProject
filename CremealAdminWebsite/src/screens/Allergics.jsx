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
  useAllergics,
  useInsertNewAllergen,
  useDeleteAllergen,
} from "../assets/api/apiFunctions";
import { useNavigate } from "react-router-dom";
import { SplitText } from "../components/SplitText ";

const columnHelper = createMRTColumnHelper();

const AllergensTable = () => {
  const { token, setToken } = useContext(UserContext);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [newAllergenLabel, setNewAllergenLabel] = useState("");
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
    data: dataAllergens = [],
    isLoading: isLoadingAllergens,
    refetch,
  } = useAllergics(token, { enabled: isTokenLoaded && !!token });
  const insertAllergenMutation = useInsertNewAllergen(token);
  const deleteAllergenMutation = useDeleteAllergen(token);

  useEffect(() => {
    if (isTokenLoaded) {
      setLoading(true);
      refetch().finally(() => setLoading(false));
    }
  }, [isTokenLoaded, refetch]);

  useEffect(() => {
    if (!isLoadingAllergens && !loading) {
      setTableData(dataAllergens);
    }
  }, [dataAllergens, isLoadingAllergens, loading]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        size: 40,
        enableEditing: false,
      }),
      columnHelper.accessor("label", {
        header: "Label",
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

  const handleAddNewRowOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleAddNewRowClose = useCallback(() => {
    setOpen(false);
    setNewAllergenLabel(""); // Clear input field on close
    setError(null);
  }, []);

  const handleAddNewRow = useCallback(async () => {
    if (!newAllergenLabel.trim()) {
      setError("Label is required");
      return;
    }
    try {
      await insertAllergenMutation.mutateAsync(newAllergenLabel);
      refetch();
      handleAddNewRowClose();
    } catch (error) {
      console.error("Error adding new allergen:", error);
      setError("Failed to add new allergen");
    }
  }, [newAllergenLabel, insertAllergenMutation, refetch, handleAddNewRowClose]);

  const handleDeleteRows = useCallback(async () => {
    try {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);
      const successfulDeletions = [];

      const deletionPromises = selectedRows.map(async (id) => {
        const success = await deleteAllergenMutation.mutateAsync(id);
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
  }, [deleteAllergenMutation, refetch, setTableData]);

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableRowSelection: true,
    selectAllMode: "page",
    enableBatchRowSelection: true,
    rowPinningDisplayMode: "select-sticky",
    columnFilterDisplayMode: "popover",
    paginationDisplayMode: "pages",
    initialState: {
      pagination: {
        pageSize: 8,
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
            Add New Allergen
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

  if (isLoadingAllergens) {
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
        height: `100vh`,
      }}
    >
      <SplitText
        text="Allergens Table"
        className="custom-class"
        delay={50}
        style={{ fontWeight: "700", fontSize: 50, color: "white" }}
      />
      <div ref={containerRef} style={{ padding: 50, width: "100%" }}>
        <MaterialReactTable table={table} />
      </div>

      <Dialog open={open} onClose={handleAddNewRowClose}>
        <DialogTitle>Add New Allergen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            variant="outlined"
            value={newAllergenLabel}
            onChange={(e) => setNewAllergenLabel(e.target.value)}
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

export default AllergensTable;
