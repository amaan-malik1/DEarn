import type { Request, Response } from "express";
export declare const signin: (req: Request, res: Response) => Promise<void>;
export declare const getPresignURL: (req: Request, res: Response) => Promise<void>;
export declare const createTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map