"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getAccessHandler", {
    enumerable: true,
    get: function() {
        return getAccessHandler;
    }
});
const _errorHandler = require("../errorHandler.js");
function getAccessHandler(options) {
    const errorHandler = (0, _errorHandler.getErrorHandler)(options);
    const fn = function access(req, res, next) {
        const handler = function(access) {
            if (![
                "public",
                "private",
                "protected"
            ].includes(access)) {
                throw new Error('Unsupported access, must be "public", "private" or "protected"');
            }
            req.access = access;
            next();
        };
        const result = options.access(req);
        if (typeof result === "string") {
            handler(result);
        } else {
            result.then(handler).catch((err)=>errorHandler(err, req, res, next));
        }
    };
    return fn;
}
