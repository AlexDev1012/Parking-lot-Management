import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Dashboard from "../pages/Dashboard";
import MyLots from "../pages/MyLots";
import ParkingSessions from "../pages/ParkingSessions";
import Permits from "../pages/Permits";
import UnenforcableDates from "../pages/UnenforcableDates";
import UserManagement from "../pages/UserManagement";
import Inbox from "../pages/Inbox";
import PaymentApp from "../pages/PaymentApp";
import ViolationSessions from "../pages/ViolationSessions";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/dashboard" replace={true} />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-user" element={<UserManagement />} />
        <Route path="my-lots" element={<MyLots />} />
        <Route path="parking-sessions" element={<ParkingSessions />} />
        <Route path="violations" element={<ViolationSessions />} />
        <Route path="permits" element={<Permits />} />
        <Route path="unenforcable-dates" element={<UnenforcableDates />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="payment-app" element={<PaymentApp />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace={true} />} />
    </Routes>
  );
};
export default AdminRoutes;
