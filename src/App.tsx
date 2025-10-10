import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { ConfirmDialog } from "primereact/confirmdialog";
import { handleAuthorize } from "./redux/slice/authReducer";
import SVGs from "./components/svg";
import Loading from "./components/Loading/Loading";
import { auth } from "./services/firebase";
import axios from "axios";
import AdminRoutes from "./routes/AdminRoutes";

import UserRoutes from "./routes/UserRoutes";
import OwnerRoutes from "./routes/OwnerRoutes";
import UnauthRoutes from "./routes/UnauthRoutes";
import TawkToScript from "./components/TawkToScript";
import { onAuthStateChanged } from "firebase/auth";
import { useAppSelector, RootState, useAppDispatch } from "./redux/store";

function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [content, setContent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    // Handle auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(handleAuthorize(user));
    });

    // Set up token refresh interval
    const tokenRefreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.getIdToken(true); // Force token refresh
          // Update axios headers with new token
          axios.defaults.headers.common["token"] =
            await currentUser.getIdToken();
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }
    }, 10 * 60 * 1000);

    // Clean up on unmount
    return () => {
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, [dispatch]);

  const renderRoutes = () => {
    if (!user) return <AdminRoutes />;
    switch (user.customClaims.level) {
      case 1:
        return <AdminRoutes />;
      case 2:
        return (
          <>
            <UserRoutes />
            <TawkToScript />
          </>
        );
      case 3:
        return <OwnerRoutes />;
      default:
        return <UnauthRoutes />;
    }
  };

  useEffect(() => {
    setContent(renderRoutes());
  }, [user]);

  return (
    <div className="w-full min-w-[300px] h-full min-h-screen relative font-roboto">
      <SVGs />
      <Loading />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <ConfirmDialog />
      <BrowserRouter>{content}</BrowserRouter>
    </div>
  );
}

export default App;
