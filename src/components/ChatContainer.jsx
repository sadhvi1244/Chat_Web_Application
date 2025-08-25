import assets, { messagesDummyData } from "../assets/assets";
import { useEffect, useRef } from "react";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();
  const myId = "680f5116f10f3cd28382ed02"; // <- replace with actual logged-in user ID

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesDummyData]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img src={assets.profile_martin} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          Martin Johnson
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="help" className="max-md:hidden w-5" />
      </div>

      {/* chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-4 space-y-4">
        {messagesDummyData.map((msg, index) => {
          const isMe = msg.senderId === myId;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar (left for others) */}
              {!isMe && (
                <img
                  src={assets.profile_martin}
                  alt="user"
                  className="w-7 h-7 rounded-full"
                />
              )}

              {/* Message bubble + timestamp */}
              <div className="flex flex-col max-w-[70%]">
                {msg.image ? (
                  <img
                    src={msg.image}
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                  />
                ) : (
                  <p
                    className={`p-2 md:text-sm font-light rounded-lg break-words text-white ${
                      isMe
                        ? "bg-violet-500/30 rounded-br-none self-end"
                        : "bg-gray-700/40 rounded-bl-none self-start"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <span
                  className={`text-xs text-gray-400 mt-1 ${
                    isMe ? "self-end" : "self-start"
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>

              {/* Avatar (right for me) */}
              {isMe && (
                <img
                  src={assets.avatar_icon}
                  alt="me"
                  className="w-7 h-7 rounded-full"
                />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            placeholder="send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img src={assets.send_button} alt="" className="w-7 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="logo" className="w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
