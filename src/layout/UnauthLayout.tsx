import { Outlet } from "react-router-dom";
import Header from "../components/Layout/Hearder/Header";
import Footer from "../components/Layout/Footer";

const UnauthLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};
export default UnauthLayout;
