import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewApplicationPage from "./pages/NewApplicationPage";
import EditApplicationPage from "./pages/EditApplicationPage"; 
import "./index.css"; 

function App() {
  const token = localStorage.getItem("token");

  return ( 
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={token ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/new-application"
          element={token ? <NewApplicationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-application/:id"
          element={token ? <EditApplicationPage /> : <Navigate to="/login" />}
        /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
