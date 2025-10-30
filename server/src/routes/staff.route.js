import { Role } from "@prisma/client";
import express from "express";
import {
  assignServiceWindow,
  checkAvailableWindow,
  getMyWindowAssignment,
  getServiceWindowDetails,
  releaseServiceWindow,
} from "../controllers/staff.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/window/:windowId/assign",
  authenticateToken,
  authorizeRoles(Role.PERSONNEL, Role.WORKING_SCHOLAR),
  assignServiceWindow
);

router.post(
  "/window/check",
  authenticateToken,
  authorizeRoles(Role.PERSONNEL, Role.WORKING_SCHOLAR),
  checkAvailableWindow
);

router.put(
  "/window/release",
  authenticateToken,
  authorizeRoles(Role.PERSONNEL, Role.WORKING_SCHOLAR),
  releaseServiceWindow
);

router.get(
  "/window/get/own",
  authenticateToken,
  authorizeRoles(Role.PERSONNEL, Role.WORKING_SCHOLAR),
  getMyWindowAssignment
);

router.get(
  "/window/get",
  authenticateToken,
  authorizeRoles(Role.PERSONNEL, Role.WORKING_SCHOLAR),
  getServiceWindowDetails
);

export default router;
