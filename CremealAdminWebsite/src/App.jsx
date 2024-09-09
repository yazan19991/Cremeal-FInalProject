import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./screens/Login";
import AboutUs from "./screens/AboutUs";
import Admin from "./screens/Admin";
import "./index.css";
import GeneralAnalytics from "./screens/GeneralAnalytics";
import UsersTable from "./components/UsersTable";
import UsersScreen from "./components/UsersScreen";
import HomePage from "./screens/HomePage";
import Header from "./screens/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useMemo, useState } from "react";
import Meals from "./screens/Meals";
import Plans from "./screens/Plans";
import Religions from "./screens/Religions";
import Allergics from "./screens/Allergics";

const queryClient = new QueryClient();
export const UserContext = createContext();

const Layout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
  </>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/AboutUs",
    element: (
      <Layout>
        <AboutUs />
      </Layout>
    ),
  },
  {
    path: "/Login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    element: <Admin />,
    children: [
      {
        path: "/Admin/statistics",
        element: <GeneralAnalytics />,
      },
      {
        path: "/Admin/users",
        element: <UsersScreen />,
      },
      {
        path: "/Admin/meals",
        element: <Meals />,
      },
      {
        path: "/Admin/plans",
        element: <Plans />,
      },
      {
        path: "/Admin/religions",
        element: <Religions />,
      },
      {
        path: "/Admin/allergics",
        element: <Allergics />,
      },
    ],
  },
]);

function App() {
  const [token, setToken] = useState({});
  const [users, setUsers] = useState({});
  const [statistic, setStatics] = useState({});

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      users,
      setUsers,
      statistic,
      setStatics,
    }),
    [token, users, statistic]
  );
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={contextValue}>
          <RouterProvider router={router} />
        </UserContext.Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
