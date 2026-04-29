import { Router } from "express";
import * as taskController from "./task.controller";
import {
  validate,
  validateAccessToken,
} from "../../core/middlewares/reqValidate.middleware";

import {
  taskDeleteParam,
  taskMoveSchema,
  taskRequestSchema,
  taskUpdateParam,
  taskUpdateSchema,
} from "../../dto/task.dto";
const router: Router = Router();

/* ================= LIST ================= */
router.post(
  "/",
  validateAccessToken,
  validate(taskRequestSchema, "body"),
  taskController.postTask,
);

router.patch(
  "/:id",
  validateAccessToken,
  validate(taskUpdateParam, "params"),
  validate(taskUpdateSchema, "body"),
  taskController.updateTask,
);

router.delete("/:listId/:id", validateAccessToken,  validate(taskDeleteParam, "params"), taskController.deleteTask);

router.patch(
  "/:id/move",
  validateAccessToken,
  validate(taskUpdateParam, "params"),
  validate(taskMoveSchema, "body"),
  taskController.moveTask,
);
export default router;
