import React, { useContext, useEffect, useState } from "react";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import basicSchema from "../schemas/schema(login)";
import { Navigate } from "react-router-dom";
import { useLogin } from "../assets/api/apiFunctions";
import { toast, Toaster } from "sonner";
import { UserContext } from "../App";

export default function Login() {
  const { token, setToken } = useContext(UserContext);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("AdminToken");
    console.log(storedToken);
    if (storedToken) {
      setToken(storedToken);
    } else if (token == null) {
      return;
    } else if (Object?.values(token)?.length !== 0) {
      sessionStorage.setItem("AdminToken", JSON.stringify(token));
    }
  }, [token, setToken]);

  const { mutateAsync } = useLogin();

  const onSubmit = async (values, actions) => {
    actions.resetForm();
    try {
      const data = await mutateAsync(values);
      if (data == null) {
        toast.error("No token received");
      }
      toast.success("Loaded the token", {
        description: "You can continue",
        onAutoClose: () => {
          setToken(data);
        },
        duration: 3,
      });
    } catch (error) {
      toast.error("Error with getting the token");
    }
  };

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: basicSchema,
    onSubmit,
  });

  if (token && Object.keys(token).length > 0) {
    return <Navigate to="/Admin/statistics" replace />;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Paper
          sx={{
            padding: 10,
            width: 400,
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <Grid
            container
            spacing={3}
            component={"form"}
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <Grid item xs={12}>
              <TextField
                name="UserName"
                id="UserName"
                error={Boolean(errors.email && touched.email)}
                label="UserName"
                type="text"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                helperText={touched.email && errors.email ? errors.email : " "}
                fullWidth
                style={{ display: "none" }}
              />
            </Grid>
            <Grid item xs={12}>
              <label
                htmlFor="password"
                style={{
                  fontSize: 20,
                  color: "white",
                  display: "block",
                  margin: "10px 0",
                }}
              >
                password
              </label>
              <TextField
                name="password"
                id="password"
                error={Boolean(errors.password && touched.password)}
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                helperText={
                  touched.password && errors.password ? errors.password : " "
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
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
