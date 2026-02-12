import { IoMdMore, IoMdArrowRoundBack } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import "./SingleChatHeader.css";
import { useAppStore } from "../../../store";
import { GET_GROUP_MEMBERS_ROUTE } from "../../../utils/constants";
import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api-client";
import { HiUserGroup } from "react-icons/hi";

import { RiRobot2Line } from "react-icons/ri";

const SingleChatHeader = () => {
  const {
    selectedChatData,
    selectedChatType,
    setActiveIcon,
    selectedChatMembers,
    setSelectedChatMembers,
    userInfo,
    setContactOrGroupProfile,
    isAIFeaturesEnabled,
    setIsAIFeaturesEnabled,
  } = useAppStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getGroupMembers = async () => {
      try {
        const response = await apiClient.get(
          `${GET_GROUP_MEMBERS_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );

        if (response.data.members) {
          setSelectedChatMembers(response.data.members);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "group") {
        getGroupMembers();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMembers]);

  return (
    <div className="single-chat-header">
      <div className="left-section">
        <div
          className="avatar"
          onClick={() => {
            setContactOrGroupProfile(selectedChatData);
            setActiveIcon("contactOrGroupProfile");
          }}
        >
          <div className="back-button" onClick={(e) => {
            e.stopPropagation();
            useAppStore.getState().setSelectedChatType(undefined);
            useAppStore.getState().setSelectedChatData(undefined);
          }}>
            <IoMdArrowRoundBack />
          </div>
          {selectedChatData.name ? (
            // <img src="./avatar.png" className="img non-present" />
            <div className="img group-img">
              <HiUserGroup />
            </div>
          ) : selectedChatData.image ? (
            <img src={selectedChatData.image} alt="avatar" className="img" />
          ) : (
            <div className="img non-present">
              {selectedChatData.firstName && selectedChatData.lastName
                ? `${selectedChatData.firstName.charAt(
                  0
                )} ${selectedChatData.lastName.charAt(0)}`
                : selectedChatData.firstName
                  ? selectedChatData.firstName.charAt(0)
                  : selectedChatData.lastName
                    ? selectedChatData.lastName.charAt(0)
                    : selectedChatData.email.charAt(0)}
            </div>
          )}
        </div>
        <div
          className="info"
          onClick={() => {
            setContactOrGroupProfile(selectedChatData);
            setActiveIcon("contactOrGroupProfile");
          }}
        >
          <div>
            {selectedChatType === "group" && selectedChatData.name}
            {selectedChatType === "contact" &&
              (selectedChatData.firstName && selectedChatData.lastName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                : selectedChatData.firstName
                  ? selectedChatData.firstName
                  : selectedChatData.lastName
                    ? selectedChatData.lastName
                    : selectedChatData.email)}
          </div>
          {selectedChatType === "group" ? (
            <div className="group-members">
              {selectedChatMembers.map((member, index) => (
                <span key={member.id} className="member">
                  {member.id === userInfo.id
                    ? "You"
                    : `${member.firstName} ${member.lastName}`}
                  {index < selectedChatMembers.length - 1 && `,\u00A0`}
                </span>
              ))}
            </div>
          ) : (
            <div>Last Seen</div>
          )}
        </div>
        <div></div>
      </div>
      <div className="icons">
        <div
          className={`icon ${isAIFeaturesEnabled ? "active-ai" : ""}`}
          onClick={() => setIsAIFeaturesEnabled(!isAIFeaturesEnabled)}
          title={isAIFeaturesEnabled ? "Disable AI Features" : "Enable AI Features"}
        >
          <RiRobot2Line />
        </div>
        <div
          className={`icon ${isSearchOpen ? "active-search" : ""}`}
          onClick={() => {
            const next = !isSearchOpen;
            setIsSearchOpen(next);
            if (!next) {
              setSearchTerm("");
            }
          }}
          title="Search in this chat"
        >
          <IoIosSearch />
        </div>
        <div className="icon currently-disabled-icon">
          <IoMdMore />
        </div>
      </div>
    </div>
  );
};

export default SingleChatHeader;
