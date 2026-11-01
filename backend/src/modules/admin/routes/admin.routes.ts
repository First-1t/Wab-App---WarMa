import { Router, type NextFunction, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '../docs/openapi.js';
import { AdminError } from '../types/admin.types.js';
import { authRouter } from './auth.routes.js';
import { feedbackRouter } from './feedback.routes.js';
import { scenarioRouter } from './scenario.routes.js';

/** รวม Route ของ Admin ทั้งหมด — mount ที่ /api/admin ใน index.ts */
export const adminRouter = Router();

adminRouter.use('/auth', authRouter);
adminRouter.use('/scenarios', scenarioRouter);
adminRouter.use('/feedback', feedbackRouter);
adminRouter.get('/docs.json', (_req: Request, res: Response) => {
  res.json(openApiDocument);
});
adminRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// แปลง error เป็น JSON รูปแบบเดียวกับ API อื่น ใช้เฉพาะใต้ /api/admin
adminRouter.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AdminError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }
  console.error('[Admin]', err);
  res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
});
