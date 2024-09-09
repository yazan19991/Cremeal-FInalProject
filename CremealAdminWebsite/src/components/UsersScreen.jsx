import React, { useContext, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";

import messageSchema from "../schemas/schema_message";
import UsersTable from "./UsersTable";
import { UserContext } from "../App";
import { useSendEmailToUsers } from "../assets/api/apiFunctions";
import { SplitText } from "./SplitText ";

export default function UsersTableScreen() {
  const [showForm, setShowForm] = useState(false);
  const [userSelected, setUsersSelected] = useState([]);
  const { token } = useContext(UserContext);
  const { mutate, isLoading, isError, error, isSuccess } =
    useSendEmailToUsers(token);

  const onSubmit = async (values, actions) => {
    actions.resetForm();
    console.log(values);
    console.log(userSelected);
    mutate({
      Emails: userSelected,
      Body: values.message,
      Subject: values.subject,
      Title: values.title,
    });

    if (!isLoading) {
      setShowForm(false);
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
      subject: "",
      title: "",
      message: "",
    },
    validationSchema: messageSchema,
    onSubmit,
  });

  return (
    <>
      <Toolbar />
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: `80vh`,
        }}
      >
        {!showForm ? (
          <UsersTable
            setShowForm={setShowForm}
            setUsersSelected={setUsersSelected}
          />
        ) : (
          <Paper sx={{ padding: 10 }}>
            <Grid
              container
              spacing={3}
              component={"form"}
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              <Grid item xs={12}>
                <Typography variant="h4" component="header">
                  Send message
                </Typography>
                <Typography variant="body1">
                  send message to all the users you select
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="title"
                  id="title"
                  error={Boolean(errors.title && touched.title)}
                  label="Title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  helperText={
                    touched.title && errors.title ? errors.title : " "
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="subject"
                  id="subject"
                  error={Boolean(errors.subject && touched.subject)}
                  label="subject"
                  value={values.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  helperText={
                    touched.subject && errors.subject ? errors.subject : " "
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="message"
                  id="message"
                  error={Boolean(errors.message && touched.message)}
                  label="Message"
                  value={values.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  helperText={
                    touched.message && errors.message ? errors.message : " "
                  }
                  maxRows={12}
                  minRows={12}
                  multiline
                  fullWidth
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  onClick={onSubmit}
                >
                  Send
                </Button>
                <Button onClick={() => setShowForm(false)}>Back</Button>
              </Grid>
            </Grid>
          </Paper>
        )}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Container>
    </>
  );
}
