import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Express 4 ไม่ส่ง error จาก async handler ไปที่ error middleware เอง */
export const asyncHandler =
  <R extends Request>(fn: (req: R, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next: NextFunction) => {
    fn(req as R, res).catch(next);
  };
