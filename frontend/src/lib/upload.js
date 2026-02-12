import { useAppStore } from "../store/index.js";
import { apiClient } from "./api-client.js";

const upload = async (file, uploadTargetId) => {
  const { setUploadProgress, setUploadFileName, setUploadTargetId } =
    useAppStore.getState();

  setUploadTargetId(uploadTargetId);
  setUploadFileName(file.name);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post("api/messages/upload-file", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        setUploadProgress(progress);
      },
    });

    setUploadProgress(0);
    setUploadTargetId(undefined);
    setUploadFileName(undefined);

    return response.data.filePath;
  } catch (error) {
    setUploadProgress(0);
    setUploadTargetId(undefined);
    setUploadFileName(undefined);
    throw error;
  }
};

export default upload;
