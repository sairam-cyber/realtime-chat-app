import { useEffect, useRef, useState } from "react";
import "./LeftSidebarProfile.css";
import { useAppStore } from "../../../store";
import { apiClient } from "../../../lib/api-client";
import {
  HOST,
  LOGOUT_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "../../../utils/constants";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import upload from "../../../lib/upload";

const LeftSidebarProfile = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const {
    activeIcon,
    setActiveIcon,
    userInfo,
    setUserInfo,
    closeChat,
    uploadProgress,
    setUploadProgress,
    uploadTargetId,
    setUploadTargetId,
    uploadFileName,
    setUploadFileName,
  } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(userInfo.image);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        console.log("Saving profile with image:", image);
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName,
            lastName,
            color: selectedColor,
            image,
          },
          {
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          // setActiveIcon("chat");
          toast.success("Profile updated successfully");
          // navigate("/chat");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // const handleFileInputClick = () => {
  //   fileInputRef.current.click();
  // };

  const navigate = useNavigate();

  const logOut = async () => {
    try {
      const response = await apiClient.post(
        LOGOUT_ROUTE,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        navigate("/auth");
        setUserInfo(null);
        closeChat();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (event) => {
    let fileUrl = null;

    try {
      const file = event.target.files[0];

      // alert if file size exceeds 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB");
        return;
      }
      if (file) {
        fileUrl = await upload(file, userInfo.id);

        if (fileUrl) {
          setImage(fileUrl);
          console.log("Image uploaded to Cloudinary:", fileUrl);
          toast.success("Image uploaded! Click 'Save Changes' to update your profile.");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="left-sidebar-profile">
      <h1>Profile</h1>

      <div className="info-container">
        {/* <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
            name="profile-image"
            accept="image/png, image/jpeg, image/jpg, image/svg, image/webp, image/jfif"
          />
        </div> */}

        <div className="info-inputs">
          <div className="info-input-container">
            {uploadProgress > 0 && uploadTargetId === userInfo.id ? (
              <div className="profile-image uploading">
                {`${uploadProgress.toFixed(2)}%`}
              </div>
            ) : (
              <div className="profile-image-wrapper" onClick={handleImageClick}>
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image">
                    <svg
                      viewBox="0 0 340 340"
                      xmlns="http://www.w3.org/2000/svg"
                      width="340"
                      height="340"
                    >
                      <path
                        fill="#2c2e3b"
                        d="m169,.5a169,169 0 1,0 2,0zm0,86a76,76 0 1
1-2,0zM57,287q27-35 67-35h92q40,0 67,35a164,164 0 0,1-226,0"
                      />
                    </svg>
                  </div>
                )}
                <div className="camera-icon-overlay">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              // name="profile-image"
              accept="image/png, image/jpeg, image/jpg, image/svg, image/webp, image/jfif"
            />
          </div>
          <div className="info-input-container">
            <input
              placeholder="Email"
              type="email"
              disabled
              value={userInfo.email}
              className="info-input disabled"
            />
          </div>
          <div className="info-input-container">
            <input
              placeholder="First Name"
              type="text"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              className="info-input"
            />
          </div>
          <div className="info-input-container">
            <input
              placeholder="Last Name"
              type="text"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              className="info-input"
            />
          </div>
        </div>
        <div className="info-input-container">
          <button
            className={`info-button ${firstName.length && lastName.length ? "" : "button-disabled"
              }`}
            onClick={saveChanges}
          >
            Save Changes
          </button>
        </div>
        <div className="info-input-container">
          <button className="logout-button" onClick={logOut}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebarProfile;
