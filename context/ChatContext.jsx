import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios } = useContext(AuthContext);

  // helper: add message only if not already present
  const addMessageSafely = (msg) => {
    if (!msg || !msg._id) return;
    setMessages((prev) => {
      if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
      return [...prev, msg];
    });
  };

  // fn to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // fn to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        const safeMessages = (data.messages || []).map((m) => ({
          _id: m._id,
          senderId: m.senderId || "unknown",
          text: m.text || "",
          image: m.image || null,
          createdAt: m.createdAt || new Date().toISOString(),
        }));
        setMessages(safeMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // fn to send message to selected user
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        // use safe adder to avoid duplicates when socket also emits
        addMessageSafely(data.newMessage);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (axios) {
      getUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axios, socket]);

  // fn to subscribe to messages
  const subscribeToMessages = () => {
    if (!socket) return;

    // remove existing handlers to avoid duplicates
    socket.off("newMessage");
    socket.off("connect");

    const handler = async (newMessage) => {
      try {
        const senderId = newMessage?.senderId && String(newMessage.senderId);
        const openUserId = selectedUser?._id && String(selectedUser._id);

        if (openUserId && senderId === openUserId) {
          // message belongs to currently open chat -> mark seen and add safely
          newMessage.seen = true;
          addMessageSafely(newMessage);
          // await marking as seen to keep server state consistent
          try {
            await axios.put(`/api/messages/mark/${newMessage._id}`);
          } catch (err) {
            console.error("mark seen failed", err);
          }
          // reset unseen count for that sender
          setUnseenMessages((prev) => ({ ...prev, [senderId]: 0 }));
        } else {
          // increment unseen counter
          setUnseenMessages((prev) => ({
            ...prev,
            [senderId]: prev[senderId] ? prev[senderId] + 1 : 1,
          }));
        }
      } catch (err) {
        console.error("socket newMessage handler error", err);
      }
    };

    socket.on("newMessage", handler);
    // ensure users/unseen are refreshed on connect
    socket.on("connect", () => {
      if (axios) getUsers();
    });
  };

  // fn to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("connect");
    }
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
    // include axios so handler uses latest axios ref; include selectedUser so handler updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedUser, axios]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
