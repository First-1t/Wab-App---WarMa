import { Request, Response } from 'express';
import { ValidationService } from '../services/validation.service.js';
import { MatchingService } from '../services/matching.service.js';

export class OutputController {
  /**
   * Handle POST /api/output/match
   * 
   * Flow:
   * 1. Validate Input (crop, plantingSeason, areaRai > 0, waterAvailableM3 > 0)
   * 2. Calculate Water Ratio & Determine Water Condition
   * 3. Match Scenario from Store
   * 4. Calculate Yield & Allocation
   * 5. Return JSON Response
   */
  static async matchScenario(req: Request, res: Response): Promise<void> {
    try {
      // 1. Validation
      const validation = ValidationService.validate(req.body);

      if (!validation.isValid || !validation.sanitized) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input parameters provided.',
          details: validation.errors,
          matchedScenario: null,
          confidence: 'out_of_bounds',
        });
        return;
      }

      // 2. Matching & Calculation
      const result = MatchingService.match(validation.sanitized);

      res.status(result.statusCode).json(result.output);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown server error';
      console.error('[OutputController.matchScenario] Unexpected error:', err);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
        matchedScenario: null,
      });
    }
  }
}
