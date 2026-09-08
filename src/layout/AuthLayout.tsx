import { Outlet } from "react-router-dom";
import SideBar from "../components/Layout/SideBar";
import Header from "../components/Layout/Hearder/Header";
import Footer from "../components/Layout/Footer";
import { useAppSelector, RootState } from "../redux/store";

const AuthLayout = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const sideBarOpen = useAppSelector(
    (state: RootState) => state.app.sideBarOpen
  );

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="flex flex-1 pt-[90px]">
          {/* Sidebar */}
          {user?.customClaims.level !== 3 && (
            <div
              className={`
              transition-all duration-300 ease-in-out flex-shrink-0
              ${sideBarOpen ? "w-[280px]" : "w-[80px]"}
            `}
            >
              <SideBar />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 transition-all duration-300 ease-in-out min-w-0">
            <Outlet />
          </div>
        </div>
        <div className="mt-8">
          <Footer />
        </div>
      </div>
    );
};

export default AuthLayout;
