import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import ProfileLandingPage from "./pages/ProfileLandingPage";
import Notification from "./components/Notification";
import "./App.css";
import { useAppStore } from "./store";
import { useEffect, useState } from "react";
import { apiClient } from "./lib/api-client";
import { GET_USER_INFO_ROUTE } from "./utils/constants";
import { toast } from "react-toastify";

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;

  return isAuthenticated ? (
    userInfo.profileSetup ? (
      <Navigate to="/chat" />
    ) : (
      <Navigate to="/profile" />
    )
  ) : (
    children
  );
};

const ChatRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;

  return isAuthenticated ? (
    userInfo.profileSetup ? (
      children
    ) : (
      <Navigate to="/profile" />
    )
  ) : (
    <Navigate to="/auth" />
  );
};

const ProfileLandingRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;

  return isAuthenticated ? (
    userInfo.profileSetup ? (
      <Navigate to="/chat" />
    ) : (
      children
    )
  ) : (
    <Navigate to="/auth" />
  );
};

function App() {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO_ROUTE, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data && response.data.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(undefined);
        }
        console.log(response);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // User is not authenticated, which is expected for initial load if not logged in.
          // We don't need to log this as an error.
          setUserInfo(undefined);
        } else {
          console.log(error);
          setUserInfo(undefined);
        }
      } finally {
        setLoading(false);
      }
    };
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return <div className="app-loading-indicator">Loading...</div>;
  }

  return (
    <div className="app">
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthPage />
              </AuthRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ChatRoute>
                <ChatPage />
              </ChatRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileLandingRoute>
                <ProfileLandingPage />
              </ProfileLandingRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>

      <Notification />
    </div>
  );
}

export default App;
