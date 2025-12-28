
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
  role: 'buyer' | 'seller';
};

const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to="/store" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
