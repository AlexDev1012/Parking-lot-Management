import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { Card } from "@tremor/react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig: firebaseui.auth.Config = {
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          if (!authResult || !authResult.user) {
            console.error("Authentication result or user is undefined");
            return false;
          }

          const authInstance = getAuth();

          if (authResult.additionalUserInfo?.isNewUser) {
            authInstance.signOut().then(() => {
              navigate("/account-disabled");
            });
            return false;
          }

          return false;
        },
        uiShown: () => {
          setLoading(false);
        },
      },
      signInFlow: "popup",
      signInSuccessUrl: `/dashboard`,
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      tosUrl: "/",
      privacyPolicyUrl: "/",
    };

    ui.start("#firebaseui-auth-container", uiConfig);

    return () => {
      if (ui.isPendingRedirect()) {
        ui.reset();
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-white shadow-xl rounded-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Company Logo"
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Loading authentication...</span>
              </div>
            </div>
          )}

          {/* Firebase UI Container */}
          <div
            id="firebaseui-auth-container"
            className="[&_.firebaseui-card-content]:p-0 
                       [&_.firebaseui-idp-button]:rounded-lg 
                       [&_.firebaseui-idp-button]:shadow-md 
                       [&_.firebaseui-idp-button]:transition-all 
                       [&_.firebaseui-idp-button:hover]:shadow-lg 
                       [&_.firebaseui-idp-button]:border-0
                       [&_.mdl-textfield]:w-full
                       [&_.mdl-textfield__input]:border-gray-300
                       [&_.mdl-textfield__input]:rounded-lg
                       [&_.mdl-textfield__input]:p-2
                       [&_.mdl-textfield__label]:text-gray-600"
          />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
