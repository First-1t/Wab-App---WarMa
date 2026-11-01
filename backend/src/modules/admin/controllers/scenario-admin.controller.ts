import type { Request, Response } from 'express';
import { ScenarioAdminService } from '../services/scenario-admin.service.js';

export const ScenarioAdminController = {
  list(_req: Request, res: Response) {
    res.json({
      success: true,
      data: ScenarioAdminService.list(),
      options: ScenarioAdminService.options(),
    });
  },

  async create(req: Request, res: Response) {
    res.status(201).json({ success: true, data: await ScenarioAdminService.create(req.body) });
  },

  async update(req: Request, res: Response) {
    res.json({
      success: true,
      data: await ScenarioAdminService.update(String(req.params.id), req.body),
    });
  },

  async remove(req: Request, res: Response) {
    await ScenarioAdminService.remove(String(req.params.id));
    res.json({ success: true });
  },
};
