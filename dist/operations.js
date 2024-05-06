"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "operations", {
    enumerable: true,
    get: function() {
        return operations;
    }
});
const _http = require("http");
const _lodashisplainobject = /*#__PURE__*/ _interop_require_default(require("lodash.isplainobject"));
const _buildQuery = require("./buildQuery.js");
const _errorHandler = require("./errorHandler.js");
const _moredots = require("./moredots.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function operations(model, options, filter) {
    const buildQuery = (0, _buildQuery.getBuildQuery)(options);
    const errorHandler = (0, _errorHandler.getErrorHandler)(options);
    function findById(filteredContext, id) {
        return filteredContext.findOne().and([
            {
                [options.idProperty]: id
            }
        ]);
    }
    function isDistinctExcluded(req) {
        if (!req.erm.query?.distinct) {
            return false;
        }
        return filter.getExcluded({
            access: req.access,
            modelName: model.modelName
        }).includes(req.erm.query.distinct);
    }
    const getItems = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        if (isDistinctExcluded(req)) {
            req.erm.result = [];
            req.erm.statusCode = 200;
            return next();
        }
        options.contextFilter(contextModel, req, (filteredContext)=>{
            buildQuery(// @ts-expect-error this is fine 🐶🔥
            filteredContext.find(), req.erm.query).then((items)=>{
                req.erm.result = items;
                req.erm.statusCode = 200;
                if (options.totalCountHeader && !req.erm.query?.distinct) {
                    options.contextFilter(contextModel, req, (countFilteredContext)=>{
                        buildQuery(countFilteredContext.countDocuments(), {
                            ...req.erm.query,
                            skip: 0,
                            limit: 0
                        }).then((count)=>{
                            req.erm.totalCount = count;
                            next();
                        }).catch((err)=>errorHandler(err, req, res, next));
                    });
                } else {
                    next();
                }
            }).catch((err)=>errorHandler(err, req, res, next));
        });
    };
    const getCount = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        options.contextFilter(contextModel, req, (filteredContext)=>{
            buildQuery(filteredContext.countDocuments(), req.erm.query).then((count)=>{
                req.erm.result = {
                    count: count
                };
                req.erm.statusCode = 200;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        });
    };
    const getShallow = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        options.contextFilter(contextModel, req, (filteredContext)=>{
            buildQuery(// @ts-expect-error this is fine 🐶🔥
            findById(filteredContext, req.params.id), req.erm.query).then((item)=>{
                if (!item) {
                    return errorHandler(new Error(_http.STATUS_CODES[404]), req, res, next);
                }
                for(const prop in item){
                    item[prop] = typeof item[prop] === "object" && prop !== "_id" ? true : item[prop];
                }
                req.erm.result = item;
                req.erm.statusCode = 200;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        });
    };
    const deleteItems = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        options.contextFilter(contextModel, req, (filteredContext)=>{
            buildQuery(filteredContext.deleteMany(), req.erm.query).then(()=>{
                req.erm.statusCode = 204;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        });
    };
    const getItem = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        if (isDistinctExcluded(req)) {
            req.erm.result = [];
            req.erm.statusCode = 200;
            return next();
        }
        options.contextFilter(contextModel, req, (filteredContext)=>{
            buildQuery(// @ts-expect-error this is fine 🐶🔥
            findById(filteredContext, req.params.id), req.erm.query).then((item)=>{
                if (!item) {
                    return errorHandler(new Error(_http.STATUS_CODES[404]), req, res, next);
                }
                req.erm.result = item;
                req.erm.statusCode = 200;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        });
    };
    const deleteItem = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        if (options.findOneAndRemove) {
            options.contextFilter(contextModel, req, (filteredContext)=>{
                // @ts-expect-error this is fine 🐶🔥
                findById(filteredContext, req.params.id).findOneAndDelete() // switched to findOneAndDelete to add support for Mongoose 7 and 8
                .then((item)=>{
                    if (!item) {
                        return errorHandler(new Error(_http.STATUS_CODES[404]), req, res, next);
                    }
                    req.erm.statusCode = 204;
                    next();
                }).catch((err)=>errorHandler(err, req, res, next));
            });
        } else {
            req.erm.document?.deleteOne() // switched to deleteOne to add support for Mongoose 7 and 8
            .then(()=>{
                req.erm.statusCode = 204;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        }
    };
    const createObject = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        req.body = filter.filterObject(req.body || {}, {
            access: req.access,
            modelName: model.modelName,
            // @ts-expect-error this is fine 🐶🔥
            populate: req.erm.query?.populate
        });
        if (req.body._id === null) {
            delete req.body._id;
        }
        // @ts-expect-error this is fine 🐶🔥
        if (contextModel.schema.options.versionKey) {
            // @ts-expect-error this is fine 🐶🔥
            delete req.body[contextModel.schema.options.versionKey];
        }
        contextModel.create(req.body).then((item)=>{
            // @ts-expect-error this is fine 🐶🔥
            return contextModel.populate(item, req.erm.query?.populate || []);
        }).then((item)=>{
            req.erm.result = item;
            req.erm.statusCode = 201;
            next();
        }).catch((err)=>errorHandler(err, req, res, next));
    };
    const modifyObject = function(req, res, next) {
        const contextModel = req.erm.model;
        if (!contextModel) {
            return errorHandler(new Error('Model is undefined.'), req, res, next);
        }
        req.body = filter.filterObject(req.body || {}, {
            access: req.access,
            modelName: model.modelName,
            // @ts-expect-error this is fine 🐶🔥
            populate: req.erm.query?.populate
        });
        delete req.body._id;
        // @ts-expect-error this is fine 🐶🔥
        if (contextModel.schema.options.versionKey) {
            // @ts-expect-error this is fine 🐶🔥
            delete req.body[contextModel.schema.options.versionKey];
        }
        function depopulate(src) {
            const dst = {};
            for (const [key, value] of Object.entries(src)){
                // @ts-expect-error this is fine 🐶🔥
                const path = contextModel.schema.path(key);
                // @ts-expect-error this is fine 🐶🔥
                // Add support for Mongoose 7 and 8 while keeping backwards-compatibility to 6 by allowing ObjectID and ObejctId 
                if (path && path.caster && (path.caster.instance === "ObjectID" || path.caster.instance === "ObjectId")) {
                    if (Array.isArray(value)) {
                        for(let j = 0; j < value.length; ++j){
                            if (typeof value[j] === "object") {
                                dst[key] = dst[key] || [];
                                // @ts-expect-error this is fine 🐶🔥
                                dst[key].push(value[j]._id);
                            }
                        }
                    } else if ((0, _lodashisplainobject.default)(value)) {
                        dst[key] = value._id;
                    }
                } else if ((0, _lodashisplainobject.default)(value)) {
                    // Add support for Mongoose 7 and 8 while keeping backwards-compatibility to 6 by allowing ObjectID and ObejctId 
                    if (path && (path.instance === "ObjectID" || path.instance === "ObjectId")) {
                        dst[key] = value._id;
                    } else {
                        dst[key] = depopulate(value);
                    }
                }
                if (typeof dst[key] === "undefined") {
                    dst[key] = value;
                }
            }
            return dst;
        }
        let cleanBody = depopulate(req.body);
        if (options.updateDeep) {
            cleanBody = (0, _moredots.moredots)(cleanBody);
        }
        if (options.findOneAndUpdate) {
            options.contextFilter(contextModel, req, (filteredContext)=>{
                // @ts-expect-error this is fine 🐶🔥
                findById(filteredContext, req.params.id).findOneAndUpdate({}, {
                    $set: cleanBody
                }, {
                    new: true,
                    upsert: options.upsert,
                    runValidators: options.runValidators
                }).exec().then((item)=>{
                    // @ts-expect-error this is fine 🐶🔥
                    return contextModel.populate(item, req.erm.query?.populate || []);
                }).then((item)=>{
                    if (!item) {
                        return errorHandler(new Error(_http.STATUS_CODES[404]), req, res, next);
                    }
                    req.erm.result = item;
                    req.erm.statusCode = 200;
                    next();
                }).catch((err)=>errorHandler(err, req, res, next));
            });
        } else {
            for (const [key, value] of Object.entries(cleanBody)){
                req.erm.document?.set(key, value);
            }
            req.erm.document?.save().then((item)=>{
                // @ts-expect-error this is fine 🐶🔥
                return contextModel.populate(item, req.erm.query?.populate || []);
            }).then((item)=>{
                req.erm.result = item;
                req.erm.statusCode = 200;
                next();
            }).catch((err)=>errorHandler(err, req, res, next));
        }
    };
    return {
        getItems,
        getCount,
        getItem,
        getShallow,
        createObject,
        modifyObject,
        deleteItems,
        deleteItem
    };
}
