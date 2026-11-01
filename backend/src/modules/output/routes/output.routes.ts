import { Router } from 'express';
import { OutputController } from '../controllers/output.controller.js';

export const outputRouter = Router();

/**
 * @route   POST /api/output/match
 * @desc    Match user agricultural inputs with calibrated DSSAT scenarios
 * @access  Public
 */
outputRouter.post('/match', OutputController.matchScenario);
