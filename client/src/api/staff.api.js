import axios from "axios";
import backendConnection from "./backendConnection.js";

// GET - Get Window Data
export const getWindowData = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/staff/window/get`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    if (response.status === 200 && response.data.success) {
      return {
        windows: response.data.windows,
      };
    }
  } catch (error) {
    console.error("Error Occured in Get Window Api: ", error);
    return null;
  }
};

export const checkAvailableWindow = async (windowIds) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/staff/window/check`,
      { windowIds },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    if (response.status === 200 && response.data.success) {
      return response.data;
    } else {
      console.warn("Unexpected API response:", response.data);
      return { availableWindows: [] };
    }
  } catch (error) {
    console.error("Error Occured in Check Available Window api: ", error);
    return null;
  }
};
export const assignServiceWindow = async (windowId) => {
  try {
    const response = await axios.post(
      `${backendConnection()}/api/staff/window/${windowId}/assign`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      } // Include auth cookies/tokens
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning window:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to assign window",
    };
  }
};

export const releaseServiceWindow = async () => {
  try {
    const response = await axios.put(
      `${backendConnection()}/api/staff/window/release`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error releasing window:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to release window",
    };
  }
};

export const getMyWindowAssignment = async () => {
  try {
    const response = await axios.get(
      `${backendConnection()}/api/staff/window/get/own`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting window assignment:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get assignment",
      assignment: null,
    };
  }
};
