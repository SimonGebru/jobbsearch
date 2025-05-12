import React, { useEffect, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface PrivateRouteProps {
  children: JSX.Element;
}

const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch {
    return true;
  }
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && isTokenExpired()) {
      localStorage.removeItem("token");
      toast.error("Din session har gått ut – du har loggats ut.");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [navigate, location]);

  const token = localStorage.getItem("token");
  return token ? children : null;
};

export default PrivateRoute;