"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getBuildQuery", {
    enumerable: true,
    get: function() {
        return getBuildQuery;
    }
});
function getBuildQuery(options) {
    return function buildQuery(query, queryOptions) {
        const promise = new Promise((resolve)=>{
            if (!queryOptions) {
                return resolve(query);
            }
            if (queryOptions.query) {
                query.where(queryOptions.query);
            }
            if (queryOptions.skip) {
                query.skip(queryOptions.skip);
            }
            if (options.limit && (!queryOptions.limit || queryOptions.limit > options.limit)) {
                queryOptions.limit = options.limit;
            }
            if (queryOptions.limit && // @ts-expect-error this is fine 🐶🔥
            query.op !== "countDocuments" && !queryOptions.distinct) {
                query.limit(queryOptions.limit);
            }
            if (queryOptions.sort) {
                // Necessary to support Mongoose 8
                if (typeof queryOptions.sort === 'object') {
                    Object.keys(queryOptions.sort).forEach((key)=>{
                        // @ts-expect-error this is fine 🐶🔥
                        queryOptions.sort[key] = Number(queryOptions.sort[key]);
                    });
                }
                // @ts-expect-error this is fine 🐶🔥
                query.sort(queryOptions.sort);
            }
            if (queryOptions.populate) {
                // @ts-expect-error this is fine 🐶🔥
                query.populate(queryOptions.populate);
            }
            if (queryOptions.select) {
                query.select(queryOptions.select);
            }
            if (queryOptions.distinct) {
                query.distinct(queryOptions.distinct);
            }
            if (options.readPreference) {
                query.read(options.readPreference);
            }
            if (options.lean) {
                query.lean(options.lean);
            }
            resolve(query);
        });
        return promise;
    };
}
