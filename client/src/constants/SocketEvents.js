// enums/socketEvents.js

export const SocketEvents = Object.freeze({
  // Queue Events
  QUEUE_CREATED: "queue:created",
  QUEUE_UPDATED: "queue:updated",
  QUEUE_DELETED: "queue:deleted",
  QUEUE_STATUS_CHANGED: "queue:status-changed",

  // Queue List Events
  QUEUE_LIST_FETCH: "fetch-queue-list",
  QUEUE_LIST_DATA: "queue-list-data",
  QUEUE_LIST_REFRESH: "queue-list-refresh",
  QUEUE_LIST_UPDATED: "queue-list-updated",

  // Session Events
  SESSION_CREATED: "session:created",
  SESSION_UPDATED: "session:updated",
  SESSION_ENDED: "session:ended",

  // Request Events
  REQUEST_UPDATED: "request:updated",
  REQUEST_COMPLETED: "request:completed",

  // Connection Events
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",

  // Legacy (to remove later)
  QUEUE_REFETCH: "queue:refetch", // Deprecated
});

// Optional: Group by category
export const QueueEvents = Object.freeze({
  QUEUE_ROOM: "queue:room",
  CREATED: "queue:created",
  UPDATED: "queue:updated",
  DELETED: "queue:deleted",
  STATUS_CHANGED: "queue:status-changed",
  REFETCH: "queue:refetch", // Deprecated
});

export const QueueListEvents = Object.freeze({
  FETCH: "fetch-queue-list",
  DATA: "queue-list-data",
  REFRESH: "queue-list-refresh",
  UPDATED: "queue-list-updated",
});

export const WindowEvents = Object.freeze({
  // Window Management Events
  ASSIGN_WINDOW: "assign:window",
  WINDOW_ASSIGNED: "window:assigned",
  WINDOW_OCCUPIED: "window:occupied",
  WINDOW_RELEASED: "window:released",
  RELEASE_WINDOW: "release:window",
  AUTO_RELEASE_WINDOW: "auto:release:window",
  WINDOW_JOINED: "window:joined",
  HEARTBEAT_UPDATE: "heartbeat:update",
});

export const QueueActions = Object.freeze({
  // Queue Actions
  CALL_NEXT: "call:next",
  TAKE_QUEUE: "take:queue",
  QUEUE_TAKEN: "queue:taken",
  UPDATE_QUEUE_STATUS: "update:queue:status",
  QUEUE_STATUS_UPDATED: "queue:status:updated",
  COMPLETE_QUEUE: "complete:queue",
  DEFER_QUEUE: "defer:queue",
  QUEUE_COMPLETED: "queue:completed",
  QUEUE_DEFERRED: "queue:deferred",
  QUEUE_CANCELLED: "queue:cancelled",
  QUEUE_PARTIALLY_COMPLETE: "queue:partial_complete",
  QUEUE_RESET: "queue:reset",
  REQUEST_DEFERRED_UPDATED: "request:updated",
});
