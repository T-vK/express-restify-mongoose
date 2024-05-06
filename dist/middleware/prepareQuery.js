"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getPrepareQueryHandler", {
    enumerable: true,
    get: function() {
        return getPrepareQueryHandler;
    }
});
const _errorHandler = require("../errorHandler.js");
const _getQuerySchema = require("../getQuerySchema.js");
function getPrepareQueryHandler(options) {
    const errorHandler = (0, _errorHandler.getErrorHandler)(options);
    const fn = function prepareQuery(req, res, next) {
        req.erm = req.erm || {};
        try {
            req.erm.query = (0, _getQuerySchema.getQueryOptionsSchema)({
                allowRegex: options.allowRegex
            }).parse(req.query || {});
            next();
        } catch (e) {
            return errorHandler(new Error("invalid_json_query"), req, res, next);
        }
    };
    return fn;
}
