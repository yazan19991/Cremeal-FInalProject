import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  List,
  ListItemText,
  styled,
  IconButton,
  Divider,
} from "@mui/material";
import React, { useContext, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import logoImage from "../assets/logo.png";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { toast, Toaster } from "sonner";
export default function NavBar() {
  const [open, setOpen] = useState(false);
  const drawerWidth = 250;
  const barHeight = 64;
  const { setToken } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }));

  const DrawerList = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <DrawerHeader sx={{ textAlign: "center" }}>
        <img
          src={logoImage}
          alt=""
          style={{ height: "80px", padding: "15px" }}
        />
      </DrawerHeader>
      <Divider />
      <List>
        {[
          { text: "General Analytics", path: "/Admin/statistics" },
          { text: "Users", path: "/Admin/users" },
          { text: "Meals", path: "/Admin/meals" },
          { text: "Plans", path: "/Admin/plans" },
          { text: "Religions", path: "/Admin/religions" },
          { text: "Allergics", path: "/Admin/allergics" },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#0e82cd" : "transparent",
                color: isActive ? "white" : "#0e82cd",
              })}
            >
              <ListItemIcon sx={{ color: "inherit" }}></ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="warning"
        sx={{
          fontWeight: 700,
          position: "absolute",
          bottom: "10px",
          left: "10px",
        }}
        onClick={() => {
          setToken("");
          navigate("/");
          sessionStorage.setItem("AdminToken", "");
        }}
      >
        Sign Out
      </Button>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ display: { md: "none" } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: "inline-block" }}
          >
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        open={open}
        onClose={toggleDrawer}
        xs={{ display: "none" }}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {DrawerList}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {DrawerList}
      </Drawer>
      <Box
        component="main"
        sx={{
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { md: `${drawerWidth}px` },
          height: `calc(100vh - ${barHeight}px)`,
        }}
      >
        <Outlet />
      </Box>
      <Toaster
        richColors
        expand={false}
        position="bottom-right"
        toastOptions={{
          style: { padding: 10 },
        }}
      />
    </>
  );
}
