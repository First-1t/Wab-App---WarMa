import { Router } from 'express';
import { ScenarioAdminController } from '../controllers/scenario-admin.controller.js';
import { requireAdmin } from '../middlewares/admin-auth.middleware.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export const scenarioRouter = Router();

scenarioRouter.use(requireAdmin);
scenarioRouter.get('/', ScenarioAdminController.list);
scenarioRouter.post('/', asyncHandler(ScenarioAdminController.create));
scenarioRouter.put('/:id', asyncHandler(ScenarioAdminController.update));
scenarioRouter.delete('/:id', asyncHandler(ScenarioAdminController.remove));
