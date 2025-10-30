import {
  Check,
  ChevronDown,
  ChevronUp,
  Pause,
  SkipForward,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  assignServiceWindow,
  checkAvailableWindow,
  getMyWindowAssignment,
  getWindowData,
} from "../../api/staff.api";
import DynamicModal from "../../components/modal/DynamicModal";
import { showToast } from "../../components/toast/ShowToast";
import "../../index.css";
import { useSocket } from "../../utils/hooks/useSocket";
import {
  formatQueueData,
  formatQueueNextItem,
} from "../../utils/QueueDetailsFormatter";
import {
  AnnounceQueue,
  handleButtonClick,
  unlockSpeech,
  useAnnounceQueueStates,
} from "../staffs/Announce_Queue";

import { SocketEvents } from "../../../../server/src/services/enums/SocketEvents.js";
import {
  currentServedQueue,
  getCallNextQueue,
  getDeferredQueue,
  getQueueListByStatus,
  markQueueStatus,
  setDeferredRequestStatus,
  setRequestStatus,
} from "../../api/staff.queue.api.js";
import { Queue_Type, Status } from "../../constants/queueEnums.js";
import { QueueActions, WindowEvents } from "../../constants/SocketEvents.js";

export default function Manage_Queue() {
  const navigate = useNavigate();
  const autoCallInProgressRef = useRef(false);
  const [deferredOpen, setDeferredOpen] = useState(true);
  const [nextInLineOpen, setNextInLineOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deferredSearchTerm, setDeferredSearchTerm] = useState("");
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Add these states for the new flow
  const [isLoading, setIsLoading] = useState(false);
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState({});
  const [availableWindows, setAvailableWindows] = useState([]);

  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(false);
  const [globalQueueList, setGlobalQueueList] = useState([]);
  const [wasQueueEmpty, setWasQueueEmpty] = useState(false);
  const DEFAULT_QUEUE = {
    queueNo: "R000",
    studentId: "N/A",
    name: "John Doe",
    course: "N/A",
    type: "N/A",
    time: "N/A",
    requests: [],
  };
  const getDefaultQueue = () => DEFAULT_QUEUE;
  const [currentQueue, setCurrentQueue] = useState(null);
  const {
    lastAnnounceTime,
    setLastAnnounceTime,
    disabledForSeconds,
    setDisabledForSeconds,
  } = useAnnounceQueueStates();

  const [queueList, setQueueList] = useState([]);

  const [deferredQueue, setDeferredQueue] = useState([]);
  const nextInLine = (globalQueueList || []).slice(0);
  const sortByPriorityPattern = useCallback((queues) => {
    console.log("🔢 Starting sort with queues:", queues?.length);

    if (!queues || queues.length === 0) {
      console.log("⚠️ No queues to sort");
      return [];
    }
    // More flexible filtering with fallbacks
    const priority = queues.filter((q) => {
      const type = q.type?.toUpperCase();
      return type === "PRIORITY";
    });
    // .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

    const regular = queues.filter((q) => {
      const type = q.type?.toUpperCase();
      return type === Queue_Type.REGULAR.toString().toUpperCase();
    });
    // .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));

    // console.log("📊 Priority count:", priority.length);
    // console.log("📊 Regular count:", regular.length);

    const sorted = [];
    let pIndex = 0;
    let rIndex = 0;

    while (pIndex < priority.length || rIndex < regular.length) {
      if (pIndex < priority.length) {
        sorted.push(priority[pIndex]);
        pIndex++;
      }

      if (rIndex < regular.length) {
        sorted.push(regular[rIndex]);
        rIndex++;
      }
    }

    // console.log("✅ Final sorted count:", sorted.length);
    return sorted;
  }, []);
  const handleAddNewQueue = useCallback(
    (newQueueData) => {
      try {
        const formattedNewQueue = formatQueueData(newQueueData);
        const simplifiedNewQueue = formatQueueNextItem(formattedNewQueue);

        setQueueList((prev) => {
          const exists = prev.some(
            (q) => q.queueId === formattedNewQueue.queueId
          );
          // console.log("Prev length:", prev.length, "Exists:", exists);

          if (exists) {
            // console.log(
            //   "🟡 Skipped duplicate queue:",
            //   formattedNewQueue.queueId
            // );
            return prev;
          }

          // ✅ Merge and apply your alternating sort
          const merged = [...prev, formattedNewQueue];
          const updated = sortByPriorityPattern(merged);

          // console.log("✅ Updating queue list to new length:", updated.length);
          return updated;
        });

        setNextInLine((prev) => {
          if (prev.some((q) => q.queueId === simplifiedNewQueue.queueId))
            return prev;

          const merged = [...prev, simplifiedNewQueue];
          const updated = sortByPriorityPattern(merged); // ✅ same pattern for next in line
          return updated;
        });
      } catch (error) {
        console.error("Error adding new queue:", error);
      }
    },
    [sortByPriorityPattern]
  );

  const handleFormatQueueData = useCallback((queueData) => {
    try {
      const formattedQueue = queueData.map(formatQueueData);
      const sortedQueue = sortByPriorityPattern(formattedQueue);
      const simplifiedQueue = sortedQueue.map(formatQueueNextItem);
      setQueueList(sortedQueue);
      if (sortedQueue.length > 0) setCurrentQueue(sortedQueue[0]);
      setNextInLine(simplifiedQueue);
    } catch (error) {
      console.error("An error occured while formatting queue details: ", error);
    }
  }, []);

  const fetchQueueList = useCallback(async () => {
    // ✅ Only fetch if window is assigned
    if (!selectedWindow?.id) {
      console.log("⚠️ No window assigned yet, skipping queue fetch");
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Fetch WAITING queues (global - no windowId)
      const waitingQueues = await getQueueListByStatus(Status.WAITING);

      if (waitingQueues && Array.isArray(waitingQueues)) {
        const formattedQueue = waitingQueues.map(formatQueueData);
        const sortedQueue = sortByPriorityPattern(formattedQueue);
        setGlobalQueueList(sortedQueue);
      }

      // ✅ Fetch DEFERRED queues (window-specific)
      const deferredQueues = await getDeferredQueue(
        Status.DEFERRED
        // selectedWindow.id
      );
      console.log("Defered Response Api", deferredQueues);
      if (deferredQueues && Array.isArray(deferredQueues)) {
        const formattedDeferred = deferredQueues.map(formatQueueData);
        console.log("Deferred Queue", formattedDeferred);
        setDeferredQueue(formattedDeferred);
      }
    } catch (error) {
      console.error("Error in fetching queue data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWindow?.id, sortByPriorityPattern]);

  // Handle when this window gets assigned
  const handleWindowAssigned = useCallback((data) => {
    console.log("🟢 Window Assigned:", data);
    showToast(data.message || "Window assigned successfully", "info");
    // Optional: refresh window status or queue
    // refreshWindowStatus();
  }, []);

  // Handle when this window is released
  const handleWindowRelease = useCallback(
    async (data) => {
      // 🚨 CASE 1: The client who owns the released window
      if (data.previousWindowId === selectedWindow?.id) {
        // Clear local state
        setSelectedWindow(null);
        setCurrentQueue(null);
        setIsLoading(true);
        localStorage.removeItem("selectedWindow");

        showToast("Your window has been released", "info");

        // 🌀 Force refresh window list — same behavior as when first loading the page
        await loadWindows(); // reuse your existing window loader
        setShowWindowModal(true); // show the window selection modal again
        return;
      }

      // 🚨 CASE 2: Other clients — just info toast + soft refresh
      showToast(`${data.message}`, "info");

      // Optional: also refresh window list in background for accuracy
      await loadWindows();
    },
    [selectedWindow?.id]
  );

  const handleError = useCallback((error) => {
    console.error("❌ Socket Error:", error);
    showToast("Connection error occurred", "error");
    setIsLoading(false);
  }, []);
  useEffect(() => {
    // ✅ Only fetch queues AFTER window is assigned
    if (selectedWindow?.id && !showWindowModal) {
      fetchQueueList();
    }
  }, [selectedWindow?.id, showWindowModal, fetchQueueList]);

  useEffect(() => {
    if (!socket || !isConnected || !selectedWindow?.id) return;

    // When new queue is created globally
    const handleQueueCreated = (newQueueData) => {
      // Just add to global list, no auto-call logic here
      const formattedNewQueue = formatQueueData(newQueueData);
      setGlobalQueueList((prev) => {
        const exists = prev.some(
          (q) => q.queueId === formattedNewQueue.queueId
        );
        if (exists) return prev;
        const merged = [...prev, formattedNewQueue];
        return sortByPriorityPattern(merged);
      });
    };
    // 🟡 When another window removes someone from the global queue
    const handleQueueRemoved = (data) => {
      setGlobalQueueList((prev) =>
        prev.filter((q) => q.queueId !== data.queueId)
      );
    };

    // 🟢 When a queue is deferred
    const handleDeferredQueue = (queue) => {
      // console.log("🟡 Queue deferred:", queue);
      const formattedDeferredQueue = formatQueueData(queue);
      showToast(
        `Queue (${formattedDeferredQueue.queueNo}) deferred`,
        "warning"
      );

      // Add to deferred list if not already there
      setDeferredQueue((prev) => {
        const exists = prev.some(
          (q) => q.queueId === formattedDeferredQueue.queueId
        );
        if (exists) return prev;
        return [...prev, formattedDeferredQueue];
      });
    };

    const handleCompleted = (queue) => {
      console.log("✅ Queue Completed:", queue);
      const formattedCompletedQueue = formatQueueData(queue);

      // Remove from deferred list if it exists there
      setDeferredQueue((prev) =>
        prev.filter((q) => q.queueId !== formattedCompletedQueue.queueId)
      );

      // Also remove from global queue list if needed
      setGlobalQueueList((prev) =>
        prev.filter((q) => q.queueId !== formattedCompletedQueue.queueId)
      );
    };

    const handleCancelled = (queue) => {
      console.log("✅ Queue Cancelled:", queue);
      const formattedCancelledQueue = formatQueueData(queue);

      // Remove from deferred list if it exists there
      setDeferredQueue((prev) =>
        prev.filter((q) => q.queueId !== formattedCancelledQueue.queueId)
      );

      // Also remove from global queue list if needed
      setGlobalQueueList((prev) =>
        prev.filter((q) => q.queueId !== formattedCancelledQueue.queueId)
      );
    };

    const handlePartiallyCompleted = (queue) => {
      console.log("✅ Queue Cancelled:", queue);
      const formattedPartialCompletedQueue = formatQueueData(queue);

      // Remove from deferred list if it exists there
      setDeferredQueue((prev) =>
        prev.filter((q) => q.queueId !== formattedPartialCompletedQueue.queueId)
      );

      // Also remove from global queue list if needed
      setGlobalQueueList((prev) =>
        prev.filter((q) => q.queueId !== formattedPartialCompletedQueue.queueId)
      );
    };

    const handleDeferredRequestUpdated = (data) => {
      console.log("🔄 Deferred request updated:", data);
      setDeferredQueue((prev) =>
        prev.map((q) =>
          q.queueId === data.queueId
            ? {
                ...q,
                requests: q.requests.map((req) =>
                  req.id === data.requestId
                    ? {
                        ...req,
                        status: normalizeStatusForDisplay(data.requestStatus),
                        // Include any other fields from the updated request if needed
                        processedBy: data.updatedRequest?.processedBy,
                        processedAt: data.updatedRequest?.processedAt,
                      }
                    : req
                ),
              }
            : q
        )
      );
      // ✅ Update selected queue's specific request
      setSelectedQueue((prev) =>
        prev && prev.queueId === data.queueId
          ? {
              ...prev,
              requests: prev.requests.map((req) =>
                req.id === data.requestId
                  ? {
                      ...req,
                      status: normalizeStatusForDisplay(data.requestStatus),
                      processedBy: data.updatedRequest?.processedBy,
                      processedAt: data.updatedRequest?.processedAt,
                    }
                  : req
              ),
            }
          : prev
      );

      // Optional: Show notification for remote updates only
      // if (data.updatedBy !== currentStaffId) {
      //   showToast(`Request in queue updated by another window`, "info");
      // }
    };

    const handleQueueReset = (data) => {
      // console.log("🔄 Queue reset to waiting:", data);
      if (data.previousWindowId === selectedWindow?.id) {
        console.log("⏭️ Skipping reset event for own window");
        return; // Don't show toast, don't process
      }

      // Format the reset data first
      const formattedResetQueue = formatQueueData(data);

      // Update global queue list with proper sorting
      setGlobalQueueList((prev) => {
        // Check if queue already exists in the list
        const existingIndex = prev.findIndex((q) => q.queueId === data.queueId);

        if (existingIndex === -1) {
          // Queue doesn't exist, add it to the list
          console.log(`Adding reset queue ${data.queueId} to list`);
          const updated = [...prev, formattedResetQueue];
          return sortByPriorityPattern(updated);
        }

        // Queue exists, update it
        const updated = prev.map((q) =>
          q.queueId === data.queueId ? formattedResetQueue : q
        );

        return sortByPriorityPattern(updated);
      });

      // Remove from current queue if it matches
      if (currentQueue?.queueId === data.queueId) {
        showToast("Duplicated", "warning");
        setCurrentQueue(null);
      }

      // Remove from deferred list if it exists there
      setDeferredQueue((prev) =>
        prev.filter((q) => q.queueId !== data.queueId)
      );

      showToast(
        `Queue ${formattedResetQueue.queueNo} was set to WAITING.`,
        "warning"
      );
    };

    socket.on(QueueActions.QUEUE_RESET, handleQueueReset);
    socket.on(QueueActions.QUEUE_DEFERRED, handleDeferredQueue);
    socket.on(
      QueueActions.REQUEST_DEFERRED_UPDATED,
      handleDeferredRequestUpdated
    );
    socket.on(QueueActions.QUEUE_CANCELLED, handleCancelled);
    socket.on(QueueActions.QUEUE_COMPLETED, handleCompleted);
    socket.on(QueueActions.QUEUE_PARTIALLY_COMPLETE, handlePartiallyCompleted);
    socket.on(SocketEvents.QUEUE_CREATED, handleQueueCreated);
    socket.on(QueueActions.QUEUE_TAKEN, handleQueueRemoved);
    socket.on(WindowEvents.ASSIGN_WINDOW, handleWindowAssigned);
    socket.on(WindowEvents.RELEASE_WINDOW, handleWindowRelease);
    socket.on("error", handleError);

    return () => {
      socket.off(QueueActions.QUEUE_RESET, handleQueueReset);
      socket.off(QueueActions.QUEUE_DEFERRED, handleDeferredQueue);
      socket.off(QueueActions.QUEUE_CANCELLED, handleCancelled);
      socket.off(QueueActions.QUEUE_COMPLETED, handleCompleted);
      socket.off(
        QueueActions.REQUEST_DEFERRED_UPDATED,
        handleDeferredRequestUpdated
      );

      socket.off(
        QueueActions.QUEUE_PARTIALLY_COMPLETE,
        handlePartiallyCompleted
      );
      socket.off(SocketEvents.QUEUE_CREATED, handleQueueCreated);
      socket.off(QueueActions.QUEUE_TAKEN, handleQueueRemoved);
      socket.off(WindowEvents.ASSIGN_WINDOW, handleWindowAssigned);
      socket.off(WindowEvents.RELEASE_WINDOW, handleWindowRelease);
      socket.off("error", handleError);
    };
  }, [
    socket,
    isConnected,
    selectedWindow?.id,
    sortByPriorityPattern,
    handleWindowAssigned,
    handleWindowRelease,
    handleError,
  ]);
  const isDefaultQueue = (queue) => {
    return queue && queue.queueNo === "R000" && queue.studentId === "N/A";
  };

  const filteredNextInLine = (nextInLine || []).filter((item) => {
    const search = searchTerm?.toLowerCase() || "";

    return (
      (item.queueNo?.toLowerCase() || "").includes(search) ||
      (item.name?.toLowerCase() || "").includes(search) ||
      (item.studentId?.toLowerCase() || "").includes(search)
    );
  });

  // console.log("Filtered Next In Line: ", filteredNextInLine);
  const handleCallNext = async (overrideWindow) => {
    const activeWindow = overrideWindow || selectedWindow;
    try {
      if (!activeWindow?.id) {
        showToast("Please select a window first.", "error");
        return;
      }
      if (currentQueue?.queueId) {
        console.log(
          `🔖 Marking previous queue ${currentQueue.queueNo} before calling next...`
        );

        try {
          const markResponse = await markQueueStatus(
            currentQueue.queueId,
            currentQueue.windowId
          );

          if (!markResponse.success) {
            console.error(
              "BLOCKING: Failed to mark previous queue:",
              markResponse.message
            );

            // 🚨 HARD FAIL - Do NOT proceed
            showToast(
              `Cannot proceed: Failed to mark ${currentQueue.queueNo} as completed. Please try again.`,
              "error"
            );
            return; // ⛔ Stop execution
          }

          console.log(
            `✅ Previous queue marked as: ${markResponse.queue.queueStatus}`
          );
        } catch (markError) {
          console.error(
            "❌ BLOCKING: Error marking previous queue:",
            markError
          );

          // 🚨 HARD FAIL - Do NOT proceed
          showToast(
            "Cannot proceed: Error updating queue status. Please try again.",
            "error"
          );
          return; // ⛔ Stop execution
        }
      }
      const response = await getCallNextQueue(activeWindow.id);
      console.log("Call Next Response:", response);

      // Handle backend response
      if (response.status === 404 || !response.success) {
        // 🟡 Gracefully handle "no queue left"
        console.log(response.data);
        if (response?.message?.includes("No queues left")) {
          showToast("🎉 No more queues left for today!", "info");
          setCurrentQueue(getDefaultQueue());
          setWasQueueEmpty(true);
          return;
        }

        showToast(response?.message || "Failed to call next queue.", "error");
        return;
      }

      const assignedQueue = response.data;
      const formattedQueue = formatQueueData(assignedQueue);

      // ✅ Set current queue for this window only
      setCurrentQueue(formattedQueue);
      console.log("Current Queue:", formattedQueue);

      // ✅ Remove from global list
      setGlobalQueueList((prev) =>
        prev.filter((q) => q.queueId !== assignedQueue.queueId)
      );

      // ✅ Broadcast to all windows
      socket.emit(QueueActions.QUEUE_TAKEN, {
        queueId: assignedQueue.queueId,
        queueNo: assignedQueue.queueNo,
        windowId: activeWindow.id,
      });

      console.log("Formatted Queue:", formattedQueue.queueNo);

      // 🗣️ Announce
      console.log("Active Windfow Name", activeWindow);
      AnnounceQueue(formattedQueue.queueNo, activeWindow.name);
      showToast(`Now serving ${formattedQueue.queueNo}`, "success");
    } catch (error) {
      console.error("Error in handleCallNext:", error);
      showToast("Error calling next queue.", "error");
    }
  };

  const handleForceRefresh = async () => {
    try {
      if (!selectedWindow?.id) {
        showToast("No window selected", "error");
        return;
      }

      setIsLoading(true);

      // Re-fetch current queue from backend
      const currentQueueResponse = await getCurrentQueueByWindow(
        selectedWindow.id
      );

      if (currentQueueResponse?.success && currentQueueResponse.queue) {
        const restoredQueue = formatQueueData(currentQueueResponse.queue);
        setCurrentQueue(restoredQueue);
        showToast("Queue synced successfully", "success");
      } else {
        setCurrentQueue(null);
        showToast("No active queue found", "info");
      }

      // Also refresh global list
      await fetchQueueList();
    } catch (error) {
      console.error("Error force refreshing:", error);
      showToast("Failed to sync queue", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const filteredDeferredQueue = deferredQueue.filter((item) => {
    const search = deferredSearchTerm?.toLowerCase() || "";
    return (
      (item.queueNo?.toLowerCase() || "").includes(search) ||
      (item.name?.toLowerCase() || "").includes(search) ||
      (item.studentId?.toLowerCase() || "").includes(search)
    );
  });
  const normalizeStatusForDisplay = (backendStatus) => {
    const displayMap = {
      COMPLETED: "Completed",
      STALLED: "Stalled",
      SKIPPED: "Skipped",
      CANCELLED: "Cancelled",
      PENDING: "Pending",
      IN_PROGRESS: "In Progress",
    };

    return displayMap[backendStatus] || backendStatus; // Fallback to original if not found
  };
  const handleRequestAction = async (requestId, action) => {
    if (!currentQueue) return;

    console.log("Request ID", requestId);
    console.log("Action", action);

    // Map frontend action to backend status
    const statusMap = {
      done: "Completed",
      stall: "Stalled",
      skip: "Skipped",
      cancel: "Cancelled",
    };

    const requestStatus = statusMap[action];
    if (!requestStatus) return;

    // 📸 Snapshot for rollback
    const snapshot = JSON.parse(JSON.stringify(currentQueue));

    try {
      // 🚀 Optimistically update UI first
      setCurrentQueue((prev) => ({
        ...prev,
        requests: prev.requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: normalizeStatusForDisplay(requestStatus),
              }
            : req
        ),
      }));

      // 📞 Call backend to update request status + queue state
      console.log("Current Queue Window: ", currentQueue);
      const response = await setRequestStatus(
        currentQueue.queueId,
        requestId,
        requestStatus,
        currentQueue.windowId
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update request");
      }

      // ✅ Optional: Sync with final backend state if needed
      // const updatedRequest = response.data.requestUpdate;
      // setCurrentQueue(formatQueueData(response.data.queueUpdate));

      showToast(`Request updated to ${requestStatus}`, "success");
    } catch (error) {
      console.error("❌ Error updating request:", error);

      // 🔄 Rollback on error
      setCurrentQueue(snapshot);
      showToast(error.message || "Error updating request", "error");
    }
  };

  const handleDeferredAction = async (requestId, action) => {
    if (!selectedQueue) return;

    const statusMap = {
      done: "Completed",
      stall: "Stalled",
      skip: "Skipped",
      cancel: "Cancelled",
    };

    const requestStatus = statusMap[action];
    if (!requestStatus) return;

    // 📸 Snapshot for rollback
    const snapshot = {
      selectedQueue: JSON.parse(JSON.stringify(selectedQueue)),
      deferredQueue: JSON.parse(JSON.stringify(deferredQueue)),
    };

    try {
      // 🚀 Update backend
      const response = await setDeferredRequestStatus(
        selectedQueue.queueId,
        requestId,
        requestStatus,
        selectedQueue.windowId
      );

      if (!response.success)
        throw new Error(
          response.message || "Failed to update deferred request"
        );

      // ✅ Optimistically update UI locally (just update status)
      setSelectedQueue((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === requestId ? { ...r, status: requestStatus } : r
        ),
      }));

      setDeferredQueue((prev) =>
        prev.map((q) =>
          q.queueId === selectedQueue.queueId
            ? {
                ...q,
                requests: q.requests.map((r) =>
                  r.id === requestId ? { ...r, status: requestStatus } : r
                ),
              }
            : q
        )
      );

      showToast(`Request updated to ${requestStatus}`, "success");
    } catch (error) {
      console.error("❌ Error updating deferred request:", error);
      setSelectedQueue(snapshot.selectedQueue);
      setDeferredQueue(snapshot.deferredQueue);
      showToast(error.message || "Error updating deferred request", "error");
    }
  };
  useEffect(() => {
    const restoreOrLoad = async () => {
      if (!socket || !isConnected) return;

      setIsLoading(true);
      try {
        const savedWindow = localStorage.getItem("selectedWindow");
        const currentAssignment = await getMyWindowAssignment();

        if (currentAssignment?.success && currentAssignment.assignment) {
          const assignedWindow = currentAssignment.assignment.serviceWindow;

          if (!assignedWindow) {
            console.warn("⚠️ No serviceWindow found in assignment object.");
            await loadWindows();
            return;
          }

          const restoredWindow = {
            id: assignedWindow.windowId,
            name: assignedWindow.windowName,
            status: "active",
          };

          setSelectedWindow(restoredWindow);
          localStorage.setItem(
            "selectedWindow",
            JSON.stringify(restoredWindow)
          );

          socket.emit(WindowEvents.WINDOW_JOINED, {
            windowId: restoredWindow.id,
          });
          setShowWindowModal(false);

          try {
            const currentQueueResponse = await currentServedQueue(
              restoredWindow.id
            );
            console.log("Current Queue Response", currentQueueResponse);

            if (currentQueueResponse?.success && currentQueueResponse.queue) {
              const restoredQueue = formatQueueData(currentQueueResponse.queue);
              setCurrentQueue(restoredQueue);
              console.log("✅ Restored current queue:", restoredQueue.queueNo);
              showToast(
                `Resumed ${restoredWindow.name} - Serving ${restoredQueue.queueNo}`,
                "info"
              );
            } else {
              console.log("ℹ️ No active queue found");
              setCurrentQueue(getDefaultQueue()); // Set default only when confirmed no queue
              showToast(`${restoredWindow.name} has no active queue`, "info");
            }
          } catch (queueError) {
            console.warn("⚠️ Could not restore current queue:", queueError);
            setCurrentQueue(getDefaultQueue()); // Set default on error
            showToast(`Resumed managing ${restoredWindow.name}`, "info");
          } finally {
            setIsLoading(false); // Stop loading after queue is set
          }
          return;
        }

        await loadWindows();
      } catch (err) {
        console.error("❌ Error restoring or loading windows:", err);
        showToast("Error restoring window data", "error");
        await loadWindows();
      }
    };

    restoreOrLoad();
  }, [socket, isConnected]);

  const loadWindows = async () => {
    try {
      const windowData = await getWindowData();
      const windows = Array.isArray(windowData)
        ? windowData
        : windowData?.windows || [windowData];

      const windowIds = windows.map((w) => w.windowId);

      // Fetch available windows (no assignment check here)
      const assignedResponse = await checkAvailableWindow(windowIds);
      const availableWindows = assignedResponse?.availableWindows || [];
      const formattedWindows = windows.map((w) => {
        const isAvailable = availableWindows.includes(w.windowId);
        const firstAvailableId = availableWindows[0]; // ✅ first available window

        return {
          id: w.windowId,
          name: w.windowName,
          status:
            isAvailable && w.windowId === firstAvailableId
              ? "active" // only first available window is clickable
              : "inactive",
        };
      });
      setAvailableWindows(formattedWindows);
      setShowWindowModal(true);
      // isLoading remains true - modal is now visible
    } catch (error) {
      console.error("❌ Error loading windows:", error);
      showToast("Failed to load windows", "error");
      setIsLoading(false); // Only stop loading on error
    }
  };

  // Window selection handler
  const handleWindowSelect = async (windowId) => {
    unlockSpeech();
    try {
      const window = availableWindows.find((w) => w.id === windowId);
      if (window.status === "inactive") {
        showToast("This window is currently occupied/inactive", "error");
        return;
      }

      const response = await assignServiceWindow(windowId);
      if (response?.success) {
        const window = availableWindows.find((w) => w.id === windowId);
        const windowData = {
          id: window.id,
          name: window.name,
          status: "active",
        };

        socket.emit(WindowEvents.WINDOW_JOINED, { windowId });
        setSelectedWindow(windowData);
        localStorage.setItem("selectedWindow", JSON.stringify(windowData));

        setShowWindowModal(false);
        showToast(`Now managing ${window.name}`, "success");

        // Check for current queue immediately
        try {
          const currentQueueResponse = await currentServedQueue(windowData.id);
          const hasCurrentQueue =
            currentQueueResponse?.success && currentQueueResponse.queue;

          if (hasCurrentQueue) {
            const restoredQueue = formatQueueData(currentQueueResponse.queue);
            setCurrentQueue(restoredQueue);
            console.log("✅ Restored current queue:", restoredQueue.queueNo);
          } else {
            setCurrentQueue(getDefaultQueue());
            console.log("🎯 Window is empty - no current queue");
          }
        } catch (err) {
          console.error("⚠️ Failed to check current queue:", err);
          setCurrentQueue(getDefaultQueue());
        } finally {
          setIsLoading(false); // Stop loading after queue is set
        }
      } else if (response?.status === 409) {
        showToast("Window already taken. Refreshing...", "error");
        await loadWindows();
      } else {
        showToast(response?.message || "Failed to assign window", "error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error selecting window:", error);
      showToast("Error selecting window", "error");
      setIsLoading(false);
    }
  };
  // Track when we have no queues available
  useEffect(() => {
    if (
      globalQueueList.length === 0 &&
      selectedWindow &&
      isDefaultQueue(currentQueue)
    ) {
      console.log("📭 No queues available - setting empty state");
      setWasQueueEmpty(true);
    }
  }, [globalQueueList.length, selectedWindow, currentQueue]);

  // Auto-call with loading state
  useEffect(() => {
    if (
      globalQueueList.length > 0 &&
      selectedWindow &&
      isDefaultQueue(currentQueue) &&
      !autoCallInProgressRef.current
    ) {
      console.log("🔄 Auto-calling next - conditions met:", {
        queueCount: globalQueueList.length,
        selectedWindow: !!selectedWindow,
        isDefaultQueue: isDefaultQueue(currentQueue),
        autoCallInProgress: autoCallInProgressRef.current,
      });

      const performAutoCall = async () => {
        autoCallInProgressRef.current = true;
        setIsLoading(true); // ✅ Start loading

        try {
          await handleCallNext(selectedWindow);
          console.log("✅ Auto-call completed successfully");
        } catch (error) {
          console.error("❌ Auto-call failed:", error);
          setWasQueueEmpty(true);
        } finally {
          autoCallInProgressRef.current = false;
          setIsLoading(false); // ✅ Stop loading
        }
      };

      // Clear the empty state immediately to prevent multiple triggers
      setWasQueueEmpty(false);

      const timeoutId = setTimeout(performAutoCall, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [globalQueueList.length, selectedWindow, handleCallNext, currentQueue]);

  const openActionPanel = (queue) => {
    setSelectedQueue(queue);
    setShowActionPanel(true);
  };

  const closeActionPanel = () => {
    setShowActionPanel(false);
    setSelectedQueue(null);
  };
  const handleDonePanel = async () => {
    if (!selectedQueue) {
      closeActionPanel();
      return;
    }

    // 📸 Snapshot for rollback (keep this for the API call case)
    const snapshot = {
      selectedQueue: JSON.parse(JSON.stringify(selectedQueue)),
      deferredQueue: JSON.parse(JSON.stringify(deferredQueue)),
    };

    try {
      // 🚀 Check if ALL requests are terminal (Completed or Cancelled only)
      const allRequestsTerminal = selectedQueue.requests.every(
        (req) => req.status === "Completed" || req.status === "Cancelled"
      );

      // Check if there are any Stalled or Skipped requests
      const hasNonTerminalRequests = selectedQueue.requests.some(
        (req) => req.status === "Stalled" || req.status === "Skipped"
      );

      if (allRequestsTerminal) {
        // ✅ All requests are Completed or Cancelled - proceed with markQueueStatus

        // Optimistically remove queue from deferred list (only for API case)
        setDeferredQueue((prev) =>
          prev.filter((q) => q.queueId !== selectedQueue.queueId)
        );
        setSelectedQueue(null);

        // 📞 Call backend to mark queue status
        const markResponse = await markQueueStatus(
          selectedQueue.queueId,
          selectedQueue.windowId
        );

        if (!markResponse?.success) {
          throw new Error(
            markResponse?.message || "Failed to finalize queue status"
          );
        }

        // ✅ Optional: Sync with final backend state if needed
        if (markResponse.queue) {
          const formattedQueue = formatQueueData(markResponse.queue);
          const finalAllRequestsTerminal = formattedQueue.requests.every(
            (req) => req.status === "Completed" || req.status === "Cancelled"
          );

          // Only update if the optimistic state differs from backend
          if (allRequestsTerminal !== finalAllRequestsTerminal) {
            if (finalAllRequestsTerminal) {
              setDeferredQueue((prev) =>
                prev.filter((q) => q.queueId !== formattedQueue.queueId)
              );
              setSelectedQueue(null);
            } else {
              setDeferredQueue((prev) =>
                prev.map((q) =>
                  q.queueId === formattedQueue.queueId ? formattedQueue : q
                )
              );
              setSelectedQueue(formattedQueue);
            }
          }
        }

        showToast(
          `Queue ${selectedQueue.queueNo} has been finalized and removed.`,
          "success"
        );
      } else {
        // ⚠️ There are Stalled, Skipped, or other non-terminal requests
        // Just close the panel without any UI updates or API calls
        showToast(
          `Queue ${selectedQueue.queueNo} cannot be finalized - has unresolved requests.`,
          "warning"
        );
      }
    } catch (error) {
      console.error("Error finalizing queue status:", error);

      // 🔄 Rollback on error (only needed for the API call case)
      setSelectedQueue(snapshot.selectedQueue);
      setDeferredQueue(snapshot.deferredQueue);

      showToast(error.message || "Error finalizing queue status", "error");
    } finally {
      closeActionPanel();
    }
  };
  const shouldDisableAnnounce = () => {
    const hasNoQueuesToServe = isDefaultQueue(currentQueue);
    const isCooldown = disabledForSeconds;

    return hasNoQueuesToServe || isCooldown;
  };
  const handleCloseWindowSelect = () => {
    setShowWindowModal(false);
    navigate("/staff/dashboard");
    // setIsLoading(false); // ✅ Stop loading when exiting modal
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50";
      case "Stalled":
        return "text-gray-600 bg-gray-50";
      case "Skipped":
        return "text-orange-600 bg-orange-50";
      case "Cancelled":
        return "text-red-600 bg-red-50";
      case "In Progress":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Define window buttons for DynamicModal
  const windowButtons = availableWindows.map((window) => ({
    text: window.name,
    onClick: () => handleWindowSelect(window.id),
    className:
      window.status === "inactive"
        ? "bg-transparent bg-[#202124] ring-1 cursor-not-allowed w-full"
        : "bg-[#1A73E8] text-white hover:bg-blue-700 w-full",
    disabled: window.status === "inactive",
  }));

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-transparent w-full p-4 md:p-10">
      <div className="max-w-full mx-auto">
        {/* Header Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-64 mb-9 mt-6 animate-pulse"></div>

        {/* Main Card Skeleton */}
        <div className="bg-white rounded-xl shadow-xs mb-4 overflow-hidden">
          <div className="p-4 md:p-6">
            {/* Window Header Skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gray-200 p-2 rounded-xl w-10 h-10 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>

            {/* Content Skeleton */}
            <div className="flex items-center justify-between gap-6 h-full">
              {/* Left Side Skeleton */}
              <div className="border-2 flex-1 border-[#E2E3E4] rounded-lg p-6 h-full">
                <div className="text-center mb-4">
                  <div className="h-20 bg-gray-200 rounded-xl mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto animate-pulse"></div>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item}>
                      <div className="h-3 bg-gray-200 rounded w-12 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side Skeleton */}
              <div className="flex flex-col flex-5 justify-between">
                <div className="flex-1">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-75 overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-5 px-4">
                              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </th>
                          </tr>
                          <tr>
                            {[1, 2, 3].map((item) => (
                              <th key={item} className="text-left py-3 px-4">
                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4].map((row) => (
                            <tr key={row} className="border-b border-gray-200">
                              {[1, 2, 3].map((cell) => (
                                <td key={cell} className="py-3 px-4">
                                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Button Skeleton */}
                <div className="flex gap-3 mt-15 justify-end">
                  {[1, 2].map((btn) => (
                    <div
                      key={btn}
                      className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deferred and Next in Line Skeleton */}
        {[1, 2].map((section) => (
          <div key={section} className="bg-white rounded-xl shadow-xs mb-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-6 animate-pulse"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-5 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="relative min-h-screen w-full">
      {/* Loading skeleton overlay */}
      {isLoading && <LoadingSkeleton />}

      {/* Window Selection Modal (always above skeleton) */}
      {showWindowModal && (
        <DynamicModal
          isOpen={showWindowModal}
          onClose={handleCloseWindowSelect}
          title="Select a Window to Manage"
          description="Please choose which service window you would like to manage."
          iconAlt="Window Selection"
          buttons={windowButtons}
          buttonLayout="grid"
          modalWidth="w-1/3"
          modalHeight="h-auto"
          showCloseButton={true}
        />
      )}
      {!isLoading && currentQueue && (
        <div className="min-h-screen bg-transparent w-full p-4 md:p-10">
          <div className="max-w-full mx-auto">
            <h1 className="text-2xl md:text-3xl font-semibold text-left text-gray-900 mb-9 mt-6">
              Manage Queue
            </h1>
            {/* Current Queue Display - Updated */}
            <div className="bg-white rounded-xl shadow-xs mb-4 overflow-hidden">
              <div className="p-4 bg- md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#F5F5F5] p-2 rounded-xl">
                    <img src="/assets/Monitor.png" alt="" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    {selectedWindow?.name || "Window 0"}
                  </span>
                </div>

                {/* container */}
                <div className="flex  items-center justify-between gap-6 h-full">
                  {/* left side */}
                  <div className="border-2 flex-1  border-[#E2E3E4] rounded-lg p-6 h-full">
                    <div className=" text-left mb-4 ">
                      <div
                        className={`text-7xl text-center ring-1 rounded-xl py-4 font-bold mb-2 text-[#1A73E8] ${
                          currentQueue.type === "Priority"
                            ? "text-[#F9AB00] border-[#F9AB00]"
                            : "text-[#1A73E8] border-[#1A73E8]"
                        }`}
                      >
                        {currentQueue.queueNo}
                      </div>
                      <span
                        className={`"font-medium text-sm px-3 py-1 rounded-full ${
                          currentQueue.type === "Priority"
                            ? "bg-[#FEF2D9] text-[#F9AB00]"
                            : "bg-[#DDEAFC] text-[#1A73E8]"
                        }`}
                      >
                        {currentQueue.type}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-left">
                      <div>
                        <div className="text-[#686969] mb-1">Name</div>
                        <div className="font-semibold text-[#202124]">
                          {currentQueue.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#686969] mb-1">Student ID</div>
                        <div className="font-semibold text-[#202124]">
                          {currentQueue.studentId}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#686969] mb-1">Course & Year</div>
                        <div className="font-semibold text-[#202124]">
                          {currentQueue.course}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#686969] mb-1">Time</div>
                        <div className="font-semibold text-[#202124]">
                          {currentQueue.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* right side */}
                  <div className="flex flex-col flex-5 justify-between">
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Scrollable wrapper for table body */}
                          <div className="h-75 overflow-y-auto custom-scrollbar">
                            <table className="w-full">
                              <thead className="bg-white sticky top-0 z-10">
                                {/* Service Requests Header Row */}
                                <tr className="border-b border-gray-200">
                                  <th
                                    colSpan="3"
                                    className="text-left py-5 px-4 text-xl font-medium  text-gray-900 "
                                  >
                                    Service Requests
                                  </th>
                                </tr>
                                {/* Table Headers */}
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-44">
                                    Request
                                  </th>
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-36">
                                    Status
                                  </th>
                                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#686969] w-16">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentQueue.requests.map((request) => (
                                  <tr
                                    key={request.id}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                                  >
                                    <td className="text-left py-3 px-4 text-sm font-medium text-[#202124]">
                                      {request.name}
                                    </td>
                                    <td className="text-left py-3 px-4">
                                      <div
                                        className={`text-xs font-medium  py-1 rounded w-24 text-left text-[#202124] `}
                                      >
                                        {request.status}
                                      </div>
                                    </td>
                                    <td className="text-center py-3 px-4">
                                      <div className="flex gap-2 items-center justify-center">
                                        {/* Done Button with Top Tooltip */}
                                        <div className="relative group">
                                          <button
                                            onClick={() =>
                                              handleRequestAction(
                                                request.id,
                                                "done"
                                              )
                                            }
                                            className="w-8 h-8 flex items-center justify-center bg-[#26BA33]/20 text-green-600 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                                          >
                                            <Check className="w-4 h-4" />
                                          </button>
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                            Done
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>

                                        {/* Stall Button with Top Tooltip */}
                                        <div className="relative group">
                                          <button
                                            onClick={() =>
                                              handleRequestAction(
                                                request.id,
                                                "stall"
                                              )
                                            }
                                            className="w-8 h-8 flex items-center justify-center bg-[#686969]/20 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                          >
                                            <img
                                              src="/assets/manage_queue/pause.png"
                                              alt="Edit"
                                            />
                                          </button>
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                            Stall
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>

                                        {/* Skip Button with Top Tooltip */}
                                        <div className="relative group">
                                          <button
                                            onClick={() =>
                                              handleRequestAction(
                                                request.id,
                                                "skip"
                                              )
                                            }
                                            className="w-8 h-8 flex items-center justify-center bg-[#ED9314]/20 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer"
                                          >
                                            <img
                                              src="/assets/manage_queue/forward.png"
                                              alt="Edit"
                                            />
                                          </button>
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                            Skip
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>

                                        {/* Cancel Button with Top Tooltip */}
                                        <div className="relative group">
                                          <button
                                            onClick={() =>
                                              handleRequestAction(
                                                request.id,
                                                "cancel"
                                              )
                                            }
                                            className="w-8 h-8 flex items-center justify-center bg-[#EA4335]/20 text-red-600 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                            Cancel
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-15 justify-end">
                      <button
                        onClick={() =>
                          handleButtonClick(
                            handleCallNext,
                            disabledForSeconds,
                            lastAnnounceTime,
                            setDisabledForSeconds,
                            setLastAnnounceTime
                          )
                        }
                        disabled={
                          disabledForSeconds ||
                          currentQueue.requests.some(
                            (request) => request.status === "In Progress"
                          )
                        }
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                          disabledForSeconds ||
                          currentQueue.requests.some(
                            (request) => request.status === "In Progress"
                          )
                            ? "bg-[#1A73E8]/50 text-gray-200 cursor-not-allowed"
                            : "bg-[#1A73E8] text-white hover:bg-blue-600 cursor-pointer"
                        }`}
                      >
                        <img
                          src="/assets/manage_queue/Announcement-1.png"
                          alt="Edit"
                        />
                        Call Next
                      </button>
                      <button
                        onClick={() =>
                          handleButtonClick(
                            () =>
                              AnnounceQueue(
                                currentQueue.queueNo,
                                selectedWindow?.name
                              ), //Announce the current queue
                            disabledForSeconds,
                            lastAnnounceTime,
                            setDisabledForSeconds,
                            setLastAnnounceTime
                          )
                        }
                        disabled={shouldDisableAnnounce()}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                          shouldDisableAnnounce()
                            ? "bg-[#FACC15]/50 cursor-not-allowed text-gray-200"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer"
                        }`}
                      >
                        <img
                          src="/assets/manage_queue/Announcement.png"
                          alt="Announce"
                        />
                        Announce
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xs mb-4 overflow-hidden">
              <button
                onClick={() => setDeferredOpen(!deferredOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">Deferred</span>
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] text-center">
                    {deferredQueue.length}
                  </span>
                </div>
                {deferredOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {deferredOpen && (
                <div className="p-4 bg-">
                  <div className="mb-4 text-right">
                    <div className="relative inline-block max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      <input
                        type="text"
                        placeholder="Search by name, ID"
                        value={deferredSearchTerm}
                        onChange={(e) => setDeferredSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Table Container */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Fixed Header */}
                    <div className="overflow-y-scroll custom-scrollbar max-h-96">
                      <table className="w-full min-w-[700px]">
                        <thead className="bg-white sticky top-0 z-10">
                          <tr className="border-b border-[#E2E3E4]">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-40">
                              Student ID
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-48">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-64">
                              Request
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-32">
                              Action
                            </th>
                          </tr>
                        </thead>

                        {/* Scrollable Body */}
                        <tbody>
                          {filteredDeferredQueue.length > 0 ? (
                            filteredDeferredQueue.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-[#E2E3E4] hover:bg-gray-50"
                              >
                                <td className="text-left py-3 px-4 text-sm text-[#202124] w-40">
                                  {item.studentId}
                                </td>
                                <td className="text-left py-3 px-4 text-sm text-[#202124] w-48">
                                  {item.name}
                                </td>
                                <td className="text-left py-3 px-4 text-sm text-[#202124] w-64">
                                  <div className="relative">
                                    {/* ✅ Add safety check for empty requests array */}
                                    {item.requests &&
                                    item.requests.length > 0 ? (
                                      <>
                                        {item.requests[0].name}
                                        {item.requests.length > 1 && (
                                          <>
                                            <span
                                              className="ml-2 bg-transparent font-semibold border-1 border-[#1A73E8] text-[#1A73E8] text-xs px-2 py-0.5 rounded-full cursor-pointer"
                                              onMouseEnter={() =>
                                                setHoveredRow(
                                                  `deferred-${index}`
                                                )
                                              }
                                              onMouseLeave={() =>
                                                setHoveredRow(null)
                                              }
                                            >
                                              +{item.requests.length - 1}
                                            </span>
                                            {hoveredRow ===
                                              `deferred-${index}` && (
                                              <div className="absolute bottom-full left-0 mb-2 border border-[#E2E3E4] bg-white text-black p-3 rounded-lg shadow-lg z-50 min-w-[200px]">
                                                {item.requests
                                                  .slice(1)
                                                  .map((req, idx) => (
                                                    <div
                                                      key={idx}
                                                      className="py-1 text-xs"
                                                    >
                                                      {req.name}
                                                    </div>
                                                  ))}
                                                <div className="absolute top-full left-38 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent"></div>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400 italic">
                                        All requests processed
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="text-left py-3 px-4">
                                  <button
                                    onClick={() => openActionPanel(item)}
                                    className="px-4 py-1.5 bg-[#1A73E8] text-white font-medium text-sm rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="py-8 text-center text-gray-500"
                              >
                                No results found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={() => setNextInLineOpen(!nextInLineOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    Next in Line
                  </span>
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] text-center">
                    {nextInLine.length}
                  </span>
                </div>
                {nextInLineOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {nextInLineOpen && (
                <div className="p-4 ">
                  <div className="mb-4 text-right">
                    <div className="relative inline-block max-w-md w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      <input
                        type="text"
                        placeholder="Search by queue number, name, ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-y-scroll custom-scrollbar max-h-96">
                      <table className="w-full min-w-[700px] ">
                        <thead className=" sticky top-0 bg-white z-10">
                          <tr className="border-b border-[#E2E3E4]">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-32">
                              Queue No.
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-40">
                              Student ID
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-48">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-64">
                              Request
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-[#686969] w-32">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredNextInLine.length > 0 ? (
                            filteredNextInLine.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-[#E2E3E4] hover:bg-gray-50 transition"
                              >
                                <td className="text-left py-4 px-4 text-sm font-semibold w-32">
                                  <span
                                    className={
                                      item.type === "Priority"
                                        ? "text-[#F9AB00]"
                                        : "text-[#1A73E8]"
                                    }
                                  >
                                    {item.queueNo}
                                  </span>
                                </td>
                                <td className="text-left py-4 px-4 text-sm text-[#202124] w-40">
                                  {item.studentId}
                                </td>
                                <td className="text-left py-4 px-4 text-sm text-[#202124] w-48">
                                  {item.name}
                                </td>
                                <td className="text-left py-4 px-4 text-sm text-[#202124] w-64">
                                  {item.requests && item.requests.length > 0 ? (
                                    <div className="relative">
                                      {/* Show first request name */}
                                      {item.requests[0].name}

                                      {item.requests.length > 1 && (
                                        <>
                                          <span
                                            className="ml-2 bg-transparent text-[#1A73E8] font-semibold border border-[#1A73E8] text-xs px-2 py-0.5 rounded-full cursor-pointer"
                                            onMouseEnter={() =>
                                              setHoveredRow(index)
                                            }
                                            onMouseLeave={() =>
                                              setHoveredRow(null)
                                            }
                                          >
                                            +{item.requests.length - 1}
                                          </span>

                                          {hoveredRow === index && (
                                            <div className="absolute bottom-full left-0 mb-2 bg-white border border-[#E2E3E4] text-black p-3 rounded-lg shadow-lg z-50 min-w-[200px]">
                                              {item.requests
                                                .slice(1)
                                                .map((req, idx) => (
                                                  <div
                                                    key={req.id}
                                                    className="py-1 text-xs"
                                                  >
                                                    {req.name}{" "}
                                                    {/* You can also add status if you want: {req.name} - {req.status} */}
                                                  </div>
                                                ))}
                                              <div className="absolute top-full left-38 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent"></div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">
                                      No requests
                                    </span>
                                  )}
                                </td>

                                <td className="text-left py-3 px-4 text-sm text-gray-900">
                                  {item.time}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="py-8 text-center text-gray-500"
                              >
                                No results found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* modal for view button */}
          {showActionPanel && selectedQueue && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6  border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Action Panel
                  </h2>
                  <button
                    onClick={closeActionPanel}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-6 h-full">
                    {/* left side */}
                    <div className="border-2 flex-1 border-[#E2E3E4] rounded-lg p-6 h-full">
                      <div className="text-left mb-4">
                        <div className="text-5xl text-center border border-[#1A73E8] rounded-xl py-3 font-bold text-blue-600 mb-2">
                          {selectedQueue.queueNo}
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                          {selectedQueue.type}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm text-left">
                        <div>
                          <div className="text-gray-500 mb-1">Name</div>
                          <div className="font-semibold text-gray-900">
                            {selectedQueue.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Student ID</div>
                          <div className="font-semibold text-gray-900">
                            {selectedQueue.studentId}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">
                            Course & Year
                          </div>
                          <div className="font-semibold text-gray-900">
                            {selectedQueue.course}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Time</div>
                          <div className="font-semibold text-gray-900">
                            {selectedQueue.time}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* right side */}
                    <div className="flex flex-col flex-5 justify-between h-full">
                      <div className="flex-1">
                        <div className="space-y-3">
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Scrollable wrapper for table body */}
                            <div className="h-75 overflow-y-auto custom-scrollbar">
                              <table className="w-full">
                                <thead className="bg-white sticky top-0 z-10">
                                  {/* Service Requests Header Row */}
                                  <tr className="border-b border-gray-200">
                                    <th
                                      colSpan="3"
                                      className="text-left py-5 px-4 text-xl font-medium text-gray-900"
                                    >
                                      Service Requests
                                    </th>
                                  </tr>
                                  {/* Table Headers */}
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-44">
                                      Request
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-36">
                                      Status
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-16">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedQueue.requests.map((request) => (
                                    <tr
                                      key={request.id}
                                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                                    >
                                      <td className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                                        {request.name}
                                      </td>
                                      <td className="text-left py-3 px-4">
                                        <div
                                          className={`text-xs font-medium py-1 rounded w-24 text-left text-[#202124]`}
                                        >
                                          {request.status}
                                        </div>
                                      </td>
                                      <td className="text-center py-3 px-4">
                                        <div className="flex gap-2 items-center justify-center">
                                          {/* Done Button with Top Tooltip */}
                                          <div className="relative group">
                                            <button
                                              onClick={() =>
                                                handleDeferredAction(
                                                  request.id,
                                                  "done"
                                                )
                                              }
                                              className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors cursor-pointer"
                                            >
                                              <Check className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                              Done
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                          </div>

                                          {/* Stall Button with Top Tooltip */}
                                          <div className="relative group">
                                            <button
                                              onClick={() =>
                                                handleDeferredAction(
                                                  request.id,
                                                  "stall"
                                                )
                                              }
                                              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                                            >
                                              <Pause className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                              Stall
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                          </div>

                                          {/* Skip Button with Top Tooltip */}
                                          <div className="relative group">
                                            <button
                                              onClick={() =>
                                                handleDeferredAction(
                                                  request.id,
                                                  "skip"
                                                )
                                              }
                                              className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors cursor-pointer"
                                            >
                                              <SkipForward className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                              Skip
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                          </div>

                                          {/* Cancel Button with Top Tooltip */}
                                          <div className="relative group">
                                            <button
                                              onClick={() =>
                                                handleDeferredAction(
                                                  request.id,
                                                  "cancel"
                                                )
                                              }
                                              className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors cursor-pointer"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                              Cancel
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-8 justify-end">
                        <button
                          onClick={handleDonePanel}
                          disabled={
                            !selectedQueue.requests.every(
                              (request) =>
                                request.status === "Completed" ||
                                request.status === "Cancelled" ||
                                request.status === "Skipped"
                            )
                          }
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                            selectedQueue.requests.every(
                              (request) =>
                                request.status === "Completed" ||
                                request.status === "Cancelled" ||
                                request.status === "Skipped"
                            )
                              ? "bg-[#1A73E8] text-white hover:bg-blue-600 cursor-pointer"
                              : "bg-[#1A73E8]/50 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
