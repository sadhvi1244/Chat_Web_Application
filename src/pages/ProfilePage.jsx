import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState("Sadhvi Kesarwani");
  const [bio, setBio] = useState("Hi Everyone, I am using QuickChat");

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justyfy-between max-sm:flex-col-reverse rounded-lg">
        <form className="flex flex-col gap-5 p-10 flec-1">
          <h3 className="text-lg">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex item-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt=""
              className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
            />{" "}
            upload profile image
          </label>
        </form>
        <img src="" alt="" />
      </div>
    </div>
  );
};

export default ProfilePage;
