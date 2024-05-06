import { RequestHandler, Request, Response, ErrorRequestHandler, Application } from 'express';
import mongoose from 'mongoose';

type Access = "private" | "protected" | "public";
type OutputFn = (req: Request, res: Response) => void | Promise<void>;
type ReadPreference = "p" | "primary" | "pp" | "primaryPreferred" | "s" | "secondary" | "sp" | "secondaryPreferred" | "n" | "nearest";
type Options = {
    prefix: `/${string}`;
    version: `/v${number}`;
    idProperty: string;
    restify: boolean;
    name?: string;
    allowRegex: boolean;
    runValidators: boolean;
    readPreference: ReadPreference;
    totalCountHeader: boolean | string;
    private: string[];
    protected: string[];
    lean: boolean;
    limit?: number;
    findOneAndRemove: boolean;
    findOneAndUpdate: boolean;
    upsert: boolean;
    preMiddleware: RequestHandler | RequestHandler[];
    preCreate: RequestHandler | RequestHandler[];
    preRead: RequestHandler | RequestHandler[];
    preUpdate: RequestHandler | RequestHandler[];
    preDelete: RequestHandler | RequestHandler[];
    updateDeep: boolean;
    access?: (req: Request) => Access | Promise<Access>;
    contextFilter: (model: mongoose.Model<unknown>, req: Request, done: (query: mongoose.Model<unknown> | mongoose.Query<unknown, unknown>) => void) => void;
    postCreate?: RequestHandler | RequestHandler[];
    postRead?: RequestHandler | RequestHandler[];
    postUpdate?: RequestHandler | RequestHandler[];
    postDelete?: RequestHandler | RequestHandler[];
    outputFn: OutputFn;
    postProcess?: (req: Request, res: Response) => void;
    onError: ErrorRequestHandler;
    modelFactory?: {
        getModel: (req: Request) => mongoose.Model<unknown>;
    };
};

declare function serve(app: Application, model: mongoose.Model<unknown>, options?: Partial<Options>): string;

export { serve };
