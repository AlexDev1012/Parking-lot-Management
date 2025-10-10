import { Navigate, Route, Routes } from "react-router-dom";
import UnauthLayout from "../layout/UnauthLayout";
import Login from "../pages/Login";
import LoginSuccess from "../pages/LoginSuccess";
import VerifyEmail from "../pages/VerifyEmail";
import DisabledUserPage from "../pages/DisabledUserPage";
import ContactSupport from "../pages/ContactSupport";

const UnauthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UnauthLayout />}>
        <Route index element={<Navigate to="/login" replace={true} />} />
        <Route path="/account-disabled" element={<DisabledUserPage />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="success" element={<LoginSuccess />} />
        <Route path="please-verify-mail" element={<VerifyEmail />} />
        <Route path="login" element={<Login />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace={true} />} />
    </Routes>
  );
};
export default UnauthRoutes;
