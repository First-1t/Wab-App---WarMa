import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ScenarioStore } from './store/scenario.store.js';
import { outputRouter } from './routes/output.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Info Endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'WarMa Output Module API (TypeScript)',
    version: '1.0.0',
    description: 'API for Scenario Matching and Output Recommendation',
    phase: 'Phase 3: Core Output Matching Engine',
  });
});

// Output Module Routes
app.use('/api/output', outputRouter);

// Health Check Endpoint (Includes Scenario Store load verification)
app.get('/api/health', (req: Request, res: Response) => {
  const allScenarios = ScenarioStore.getAllScenarios();
  res.json({
    status: 'ok',
    service: 'warma-output-backend',
    typescript: true,
    storeLoaded: true,
    scenarioCount: allScenarios.length,
    supportedCrops: ScenarioStore.getAvailableOptions().crops,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint to view available options (crops, seasons, water conditions)
app.get('/api/scenarios/options', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: ScenarioStore.getAvailableOptions(),
  });
});

// Endpoint to view scenarios in the store (Read-only verification for Phase 2)
app.get('/api/scenarios', (req: Request, res: Response) => {
  const { crop, season, waterCondition } = req.query;
  const scenarios = ScenarioStore.findScenarios({
    crop: typeof crop === 'string' ? crop : undefined,
    plantingSeason: typeof season === 'string' ? season : undefined,
    waterCondition: typeof waterCondition === 'string' ? waterCondition : undefined,
  });
  res.json({
    success: true,
    count: scenarios.length,
    data: scenarios,
  });
});

// Start Server
app.listen(PORT, () => {
  const count = ScenarioStore.getAllScenarios().length;
  console.log(`[Backend] WarMa Output Server (TS) is running on port ${PORT}`);
  console.log(`[Backend] Predefined Scenario Store successfully loaded with ${count} scenarios`);
  console.log(`[Backend] Health check: http://localhost:${PORT}/api/health`);
});
