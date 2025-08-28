import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

const initialToken = localStorage.getItem("token");
if (initialToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // loading flag: if there's an initial token, wait until checkAuth completes
  const [loading, setLoading] = useState(!!initialToken);

  // ✅ Set axios Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (data.success) {
        // support both data.user and data.userData shapes
        const user = data.user || data.userData;
        setAuthUser(user);
        connectSocket(user);
      } else {
        setAuthUser(null);
        setToken(null);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      // don't spam user on first load; show only if actionable
      console.error("checkAuth error:", error?.response?.data || error.message);
      setAuthUser(null);
      setToken(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);

        // ✅ Store token properly
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    // ✅ Remove auth header
    delete axios.defaults.headers.common["Authorization"];

    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
  };

  // Update Profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile Updated Successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // Run checkAuth on first load
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      // no token, nothing to check
      setLoading(false);
    }
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};
