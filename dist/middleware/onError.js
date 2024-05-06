"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getOnErrorHandler", {
    enumerable: true,
    get: function() {
        return getOnErrorHandler;
    }
});
const _serializeerror = require("serialize-error");
function getOnErrorHandler(isExpress) {
    const fn = function onError(err, req, res) {
        const serializedErr = (0, _serializeerror.serializeError)(err);
        delete serializedErr.stack;
        if (serializedErr.errors) {
            for(const key in serializedErr.errors){
                delete serializedErr.errors[key].reason;
                delete serializedErr.errors[key].stack;
            }
        }
        res.setHeader("Content-Type", "application/json");
        if (isExpress) {
            res.status(req.erm.statusCode || 500).send(serializedErr);
        } else {
            // @ts-expect-error restify
            res.send(req.erm.statusCode, serializedErr);
        }
    };
    return fn;
}
