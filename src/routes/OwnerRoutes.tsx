import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import ValidationPermits from "../pages/ValidationPermits";

const OwnerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/user-permits" replace={true} />} />
        <Route path="user-permits" element={<ValidationPermits />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to="/user-permits" replace={true} />}
      />
    </Routes>
  );
};
export default OwnerRoutes;
