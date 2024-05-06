"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "serve", {
    enumerable: true,
    get: function() {
        return serve;
    }
});
const _util = require("util");
const _access = require("./middleware/access.js");
const _ensureContentType = require("./middleware/ensureContentType.js");
const _filterAndFindById = require("./middleware/filterAndFindById.js");
const _onError = require("./middleware/onError.js");
const _outputFn = require("./middleware/outputFn.js");
const _prepareOutput = require("./middleware/prepareOutput.js");
const _prepareQuery = require("./middleware/prepareQuery.js");
const _operations = require("./operations.js");
const _resource_filter = require("./resource_filter.js");
const defaultOptions = {
    prefix: "/api",
    version: "/v1",
    idProperty: "_id",
    restify: false,
    allowRegex: false,
    runValidators: false,
    readPreference: "primary",
    totalCountHeader: false,
    private: [],
    protected: [],
    lean: true,
    findOneAndUpdate: true,
    findOneAndRemove: true,
    upsert: false,
    preMiddleware: [],
    preCreate: [],
    preRead: [],
    preUpdate: [],
    preDelete: [],
    updateDeep: true
};
const filter = new _resource_filter.Filter();
function serve(app, model, options = {}) {
    const serveOptions = {
        ...defaultOptions,
        name: typeof options.name === "string" ? options.name : model.modelName,
        contextFilter: (model, req, done)=>done(model),
        outputFn: (0, _outputFn.getOutputFnHandler)(typeof options.restify === "boolean" ? !options.restify : !defaultOptions.restify),
        onError: (0, _onError.getOnErrorHandler)(typeof options.restify === "boolean" ? !options.restify : !defaultOptions.restify),
        ...options
    };
    model.schema.eachPath((name, path)=>{
        if (path.options.access) {
            switch(path.options.access.toLowerCase()){
                case "private":
                    serveOptions.private.push(name);
                    break;
                case "protected":
                    serveOptions.protected.push(name);
                    break;
            }
        }
    });
    filter.add(model, {
        filteredKeys: {
            private: serveOptions.private,
            protected: serveOptions.protected
        }
    });
    const ops = (0, _operations.operations)(model, serveOptions, filter);
    let uriItem = `${serveOptions.prefix}${serveOptions.version}/${serveOptions.name}`;
    if (uriItem.indexOf("/:id") === -1) {
        uriItem += "/:id";
    }
    const uriItems = uriItem.replace("/:id", "");
    const uriCount = uriItems + "/count";
    const uriShallow = uriItem + "/shallow";
    if (typeof app.delete === "undefined") {
        // @ts-expect-error restify
        app.delete = app.del;
    }
    // @ts-expect-error restify
    const modelMiddleware = async (req, res, next)=>{
        const getModel = serveOptions?.modelFactory?.getModel;
        req.erm = {
            model: typeof getModel === 'function' ? await getModel(req) : model
        };
        next();
    };
    const accessMiddleware = serveOptions.access ? (0, _access.getAccessHandler)({
        access: serveOptions.access,
        idProperty: serveOptions.idProperty,
        onError: serveOptions.onError
    }) : [];
    const ensureContentType = (0, _ensureContentType.getEnsureContentTypeHandler)(serveOptions);
    const filterAndFindById = (0, _filterAndFindById.getFilterAndFindByIdHandler)(serveOptions);
    const prepareQuery = (0, _prepareQuery.getPrepareQueryHandler)(serveOptions);
    const prepareOutput = (0, _prepareOutput.getPrepareOutputHandler)(serveOptions, model.modelName, filter);
    app.get(uriItems, modelMiddleware, prepareQuery, serveOptions.preMiddleware, serveOptions.preRead, accessMiddleware, ops.getItems, prepareOutput);
    app.get(uriCount, modelMiddleware, prepareQuery, serveOptions.preMiddleware, serveOptions.preRead, accessMiddleware, ops.getCount, prepareOutput);
    app.get(uriItem, modelMiddleware, prepareQuery, serveOptions.preMiddleware, serveOptions.preRead, accessMiddleware, ops.getItem, prepareOutput);
    app.get(uriShallow, modelMiddleware, prepareQuery, serveOptions.preMiddleware, serveOptions.preRead, accessMiddleware, ops.getShallow, prepareOutput);
    app.post(uriItems, modelMiddleware, prepareQuery, ensureContentType, serveOptions.preMiddleware, serveOptions.preCreate, accessMiddleware, ops.createObject, prepareOutput);
    app.post(uriItem, modelMiddleware, (0, _util.deprecate)(prepareQuery, "express-restify-mongoose: in a future major version, the POST method to update resources will be removed. Use PATCH instead."), ensureContentType, serveOptions.preMiddleware, serveOptions.findOneAndUpdate ? [] : filterAndFindById, serveOptions.preUpdate, accessMiddleware, ops.modifyObject, prepareOutput);
    app.put(uriItem, modelMiddleware, (0, _util.deprecate)(prepareQuery, "express-restify-mongoose: in a future major version, the PUT method will replace rather than update a resource. Use PATCH instead."), ensureContentType, serveOptions.preMiddleware, serveOptions.findOneAndUpdate ? [] : filterAndFindById, serveOptions.preUpdate, accessMiddleware, ops.modifyObject, prepareOutput);
    app.patch(uriItem, modelMiddleware, prepareQuery, ensureContentType, serveOptions.preMiddleware, serveOptions.findOneAndUpdate ? [] : filterAndFindById, serveOptions.preUpdate, accessMiddleware, ops.modifyObject, prepareOutput);
    app.delete(uriItems, modelMiddleware, prepareQuery, serveOptions.preMiddleware, serveOptions.preDelete, ops.deleteItems, prepareOutput);
    app.delete(uriItem, modelMiddleware, prepareQuery, serveOptions.preMiddleware, serveOptions.findOneAndRemove ? [] : filterAndFindById, serveOptions.preDelete, ops.deleteItem, prepareOutput);
    return uriItems;
}
