import { RiEmojiStickerLine } from "react-icons/ri";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { IoMdMic } from "react-icons/io";
import { MdScheduleSend } from "react-icons/md";
import { BsMagic, BsFileText } from "react-icons/bs";
import "./SingleChatMessageBar.css";
import { useAppStore } from "../../../store";
import { useSocket } from "../../../context/SocketContext";
import upload from "../../../lib/upload";
import { apiClient } from "../../../lib/api-client";
import { SCHEDULE_MESSAGE_ROUTE, SMART_REPLY_ROUTE, SUMMARIZE_CHAT_ROUTE } from "../../../utils/constants";

const SingleChatMessageBar = () => {
  const emojiRef = useRef();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const socket = useSocket();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setRefreshChatList,
    setActiveChatId,
    setPlaceholderMessage,
    setShowFileUploadPlaceholder,
    isAIFeaturesEnabled,
  } = useAppStore();

  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((message) => message + emoji.emoji);
  };

  const messageInputRef = useRef();

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedChatData]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "group") {
      socket.emit("sendGroupMessage", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        groupId: selectedChatData._id,
      });
    }
    setActiveChatId(selectedChatData._id);
    setPlaceholderMessage(message);
    setMessage("");
    setRefreshChatList(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const fileInputRef = useRef();

  const handleFileAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (file) => {
    let fileUrl = null;
    try {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB");
        return;
      }

      if (file) {
        fileUrl = await upload(file, selectedChatData._id);

        if (fileUrl) {
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: fileUrl,
            });
          } else if (selectedChatType === "group") {
            socket.emit("sendGroupMessage", {
              sender: userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: fileUrl,
              groupId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      alert(`File upload failed: ${error.message || "Unknown error"}. Check console.`);
    }
  };

  const handleFileAttachmentChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "voice-message.webm", {
          type: "audio/webm",
        });
        audioChunksRef.current = [];
        await handleFileUpload(audioFile);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleMessageText, setScheduleMessageText] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const handleScheduleMessage = async () => {
    if (!scheduleMessageText.trim() || !scheduleDate) {
      alert("Please enter a message and select a date/time.");
      return;
    }

    try {
      const response = await apiClient.post(
        SCHEDULE_MESSAGE_ROUTE,
        {
          recipient: selectedChatData._id,
          messageType: "text",
          content: scheduleMessageText,
          scheduledAt: scheduleDate,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Message scheduled successfully!");
        setShowScheduleModal(false);
        setScheduleMessageText("");
        setScheduleDate("");
      }
    } catch (error) {
      console.error("Error scheduling message:", error);
      alert(error.response?.data?.error || "Failed to schedule message.");
    }
  };

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSummarize = async () => {
    setLoadingAI(true);
    try {
      const response = await apiClient.post(
        SUMMARIZE_CHAT_ROUTE,
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.summary) {
        setSummaryText(response.data.summary);
        setShowSummaryModal(true);
      }
    } catch (error) {
      console.error("Error summarizing chat:", error);
      alert("Failed to summarize chat.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSmartReply = async () => {
    setLoadingAI(true);
    try {
      const response = await apiClient.post(
        SMART_REPLY_ROUTE,
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.reply) {
        setMessage(response.data.reply);
      }
    } catch (error) {
      console.error("Error getting smart reply:", error);
      alert("Failed to get smart reply.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <>
      <div className="message-bar">
        <div className="message-bar-icon">
          <div className="emoji-picker-icon" ref={emojiRef}>
            <RiEmojiStickerLine
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            />
            <div className="emoji-picker">
              <EmojiPicker
                theme="dark"
                open={emojiPickerOpen}
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
              />
            </div>
          </div>
        </div>
        <button className="message-bar-icon" onClick={handleFileAttachmentClick}>
          <GrAttachment />
        </button>
        <button
          className="message-bar-icon"
          onClick={() => setShowScheduleModal(true)}
          title="Schedule Message"
        >
          <MdScheduleSend />
        </button>
        <button
          className={`message-bar-icon ${isRecording ? "recording" : ""}`}
          onClick={toggleRecording}
          style={{ color: isRecording ? "red" : "inherit" }}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <IoMdMic />
        </button>

        {isAIFeaturesEnabled && (
          <>
            <button
              className="message-bar-icon"
              onClick={handleSummarize}
              title="Summarize Last 10 Messages"
              disabled={loadingAI}
            >
              <BsFileText />
            </button>
            <button
              className="message-bar-icon"
              onClick={handleSmartReply}
              title="Smart Reply"
              disabled={loadingAI}
            >
              <BsMagic />
            </button>
          </>
        )}

        <input
          type="file"
          className="attachment-hidden-input"
          ref={fileInputRef}
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileAttachmentChange}
        />
        <div className="message-bar-searchbar">
          <input
            type="text"
            placeholder={isRecording ? "Recording audio..." : "Type a message..."}
            value={message}
            ref={messageInputRef}
            onChange={(e) => setMessage(e.target.value)}
            className="message-bar-search-input"
            onKeyDown={handleKeyDown}
            disabled={isRecording}
          />
        </div>
        <div className="message-bar-icon" onClick={handleSendMessage}>
          <IoSend />
        </div>
      </div>

      {showScheduleModal && (
        <div className="schedule-modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Message</h3>
            <textarea
              placeholder="Type your message here..."
              value={scheduleMessageText}
              onChange={(e) => setScheduleMessageText(e.target.value)}
            />
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <div className="schedule-modal-actions">
              <button onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button onClick={handleScheduleMessage}>Schedule</button>
            </div>
          </div>
        </div>
      )}

      {showSummaryModal && (
        <div className="schedule-modal-overlay" onClick={() => setShowSummaryModal(false)}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Chat Summary</h3>
            <p className="summary-text">{summaryText}</p>
            <div className="schedule-modal-actions">
              <button onClick={() => setShowSummaryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleChatMessageBar;
