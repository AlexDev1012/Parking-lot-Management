import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Dashboard from "../pages/Dashboard";
import MyLots from "../pages/MyLots";
import ParkingSessions from "../pages/ParkingSessions";
import PaymentApp from "../pages/PaymentApp";
import Permits from "../pages/Permits";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/dashboard" replace={true} />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-lots" element={<MyLots />} />
        <Route path="parking-sessions" element={<ParkingSessions />} />
        <Route path="permits" element={<Permits />} />
        <Route path="payment-app" element={<PaymentApp />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace={true} />} />
    </Routes>
  );
};
export default UserRoutes;
