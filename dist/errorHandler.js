"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getErrorHandler", {
    enumerable: true,
    get: function() {
        return getErrorHandler;
    }
});
const _http = require("http");
function getErrorHandler(options) {
    const fn = function errorHandler(err, req, res, next) {
        if (err.message === _http.STATUS_CODES[404] || req.params?.id && err.path === options.idProperty && err.name === "CastError") {
            req.erm.statusCode = 404;
        } else {
            req.erm.statusCode = req.erm.statusCode && req.erm.statusCode >= 400 ? req.erm.statusCode : 400;
        }
        options.onError(err, req, res, next);
    };
    return fn;
}
