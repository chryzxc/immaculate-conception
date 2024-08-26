import "@mantine/core/styles.css";
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import "./App.css";

import { MantineProvider, createTheme } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AnnouncementPage from "./pages/AnnouncementPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import { Notifications } from "@mantine/notifications";
import PageNotFound from "./pages/PageNotFound";
import PriestPage from "./pages/PriestPage";
import { routes } from "./constants/routes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="*" element={<PageNotFound />} />
            <Route path="/" element={<HomePage />} />
            {/* {user ? ( */}
            <Route element={<Layout />}>
              <Route path={routes.dashboard} element={<DashboardPage />} />
              <Route path={routes.priests} element={<PriestPage />} />
              {/* <Route path={routes.mass} element={<MassPage />} /> */}
              <Route
                path={routes.announcements}
                element={<AnnouncementPage />}
              />
              {/*  <Route path="/appointments" element={<AppointmentPage />} /> */}
            </Route>
            {/* ) : ( */}
            <Route path={routes.login} element={<LoginPage />} />
            {/* )} */}
          </Routes>
        </Router>
      </QueryClientProvider>
    </MantineProvider>
  );
};

const theme = createTheme({
  colors: {
    primary: [
      "#7b9bd8",
      "#6e8ccf",
      "#6280c4",
      "#5573b9",
      "#4a66a5",
      "#3e598f",
      "#13274f",
      "#112d57",
      "#0f274e",
      "#0d1f46",
    ],
    secondary: [
      "#a0b8a9",
      "#95b2a0",
      "#89a89a",
      "#7da295",
      "#719b8f",
      "#64958a",
      "#8da399",
      "#7a8e85",
      "#6e7d77",
      "#62746a",
    ],
  },
  primaryColor: "primary",
});

export default App;
