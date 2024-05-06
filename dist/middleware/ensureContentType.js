"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getEnsureContentTypeHandler", {
    enumerable: true,
    get: function() {
        return getEnsureContentTypeHandler;
    }
});
const _errorHandler = require("../errorHandler.js");
function getEnsureContentTypeHandler(options) {
    const errorHandler = (0, _errorHandler.getErrorHandler)(options);
    const fn = function ensureContentType(req, res, next) {
        const contentType = req.headers["content-type"];
        if (!contentType) {
            return errorHandler(new Error("missing_content_type"), req, res, next);
        }
        if (!contentType.includes("application/json")) {
            return errorHandler(new Error("invalid_content_type"), req, res, next);
        }
        next();
    };
    return fn;
}
