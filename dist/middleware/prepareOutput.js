"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getPrepareOutputHandler", {
    enumerable: true,
    get: function() {
        return getPrepareOutputHandler;
    }
});
const _errorHandler = require("../errorHandler.js");
function isDefined(arg) {
    return typeof arg !== "undefined";
}
function getPrepareOutputHandler(options, modelName, filter) {
    const errorHandler = (0, _errorHandler.getErrorHandler)(options);
    const fn = function prepareOutput(req, res, next) {
        const postMiddleware = (()=>{
            switch(req.method.toLowerCase()){
                case "get":
                    {
                        return Array.isArray(options.postRead) ? options.postRead : [
                            options.postRead
                        ];
                    }
                case "post":
                    {
                        if (req.erm.statusCode === 201) {
                            return Array.isArray(options.postCreate) ? options.postCreate : [
                                options.postCreate
                            ];
                        }
                        return Array.isArray(options.postUpdate) ? options.postUpdate : [
                            options.postUpdate
                        ];
                    }
                case "put":
                case "patch":
                    {
                        return Array.isArray(options.postUpdate) ? options.postUpdate : [
                            options.postUpdate
                        ];
                    }
                case "delete":
                    {
                        return Array.isArray(options.postDelete) ? options.postDelete : [
                            options.postDelete
                        ];
                    }
                default:
                    {
                        return [];
                    }
            }
        })().filter(isDefined);
        const callback = ()=>{
            // TODO: this will, but should not, filter /count queries
            if (req.erm.result) {
                req.erm.result = filter.filterObject(req.erm.result, {
                    access: req.access,
                    modelName,
                    // @ts-expect-error this is fine 🐶🔥
                    populate: req.erm.query?.populate
                });
            }
            if (options.totalCountHeader && typeof req.erm.totalCount === "number") {
                res.header(typeof options.totalCountHeader === "string" ? options.totalCountHeader : "X-Total-Count", `${req.erm.totalCount}`);
            }
            const promise = options.outputFn(req, res);
            if (options.postProcess) {
                if (promise && typeof promise.then === "function") {
                    promise.then(()=>{
                        options.postProcess?.(req, res);
                    }).catch((err)=>errorHandler(err, req, res, next));
                } else {
                    options.postProcess(req, res);
                }
            }
        };
        if (!postMiddleware || postMiddleware.length === 0) {
            return callback();
        }
        postMiddleware.reduce(async (acc, middleware)=>{
            await acc;
            return new Promise((resolve, reject)=>{
                middleware(req, res, (err)=>err ? reject(err) : resolve(err));
            });
        }, Promise.resolve()).then(callback).catch((err)=>errorHandler(err, req, res, next));
    };
    return fn;
}
