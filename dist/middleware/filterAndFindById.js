"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getFilterAndFindByIdHandler", {
    enumerable: true,
    get: function() {
        return getFilterAndFindByIdHandler;
    }
});
const _http = require("http");
const _errorHandler = require("../errorHandler.js");
function getFilterAndFindByIdHandler(options) {
    const errorHandler = (0, _errorHandler.getErrorHandler)(options);
    const fn = function filterAndFindById(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        if (!req.params.id) {
            return next();
        }
        options.contextFilter(contextModel, req, (filteredContext)=>{
            filteredContext// @ts-expect-error this is fine 🐶🔥
            .findOne().and({
                [options.idProperty]: req.params.id
            }).lean(false).read(options.readPreference || "p").exec().then((doc)=>{
                if (!doc) {
                    return errorHandler(new Error(_http.STATUS_CODES[404]), req, res, next);
                }
                req.erm.document = doc;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        });
    };
    return fn;
}
