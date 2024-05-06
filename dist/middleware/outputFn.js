"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getOutputFnHandler", {
    enumerable: true,
    get: function() {
        return getOutputFnHandler;
    }
});
function getOutputFnHandler(isExpress) {
    const fn = function outputFn(req, res) {
        if (!req.erm.statusCode) {
            throw new Error("statusCode not set");
        }
        if (isExpress) {
            if (req.erm.result) {
                res.status(req.erm.statusCode).json(req.erm.result);
            } else {
                res.sendStatus(req.erm.statusCode);
            }
        } else {
            // @ts-expect-error restify
            res.send(req.erm.statusCode, req.erm.result);
        }
    };
    return fn;
}
