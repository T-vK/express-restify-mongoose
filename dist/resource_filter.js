"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Filter", {
    enumerable: true,
    get: function() {
        return Filter;
    }
});
const _dotprop = /*#__PURE__*/ _interop_require_default(require("dot-prop"));
const _detective = require("./detective.js");
const _weedout = require("./weedout.js");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { get: getProperty, has: hasProperty } = _dotprop.default; // Because we're using an older version of dotProp that supports CommonJS
class Filter {
    add(model, options) {
        if (model.discriminators) {
            for(const modelName in model.discriminators){
                const excluded = this.excludedMap.get(modelName);
                if (excluded) {
                    options.filteredKeys.private = options.filteredKeys.private.concat(excluded.filteredKeys.private);
                    options.filteredKeys.protected = options.filteredKeys.protected.concat(excluded.filteredKeys.protected);
                }
            }
        }
        this.excludedMap.set(model.modelName, {
            filteredKeys: options.filteredKeys,
            model
        });
    }
    /**
   * Gets excluded keys for a given model and access.
   */ getExcluded(options) {
        if (options.access === "private") {
            return [];
        }
        const filteredKeys = this.excludedMap.get(options.modelName)?.filteredKeys;
        if (!filteredKeys) {
            return [];
        }
        return options.access === "protected" ? filteredKeys.private : filteredKeys.private.concat(filteredKeys.protected);
    }
    /**
   * Removes excluded keys from a document.
   */ filterItem(item, excluded) {
        if (!item) {
            return item;
        }
        if (Array.isArray(item)) {
            return item.map((i)=>this.filterItem(i, excluded));
        }
        if (excluded) {
            if (typeof item.toObject === "function") {
                item = item.toObject();
            }
            for(let i = 0; i < excluded.length; i++){
                (0, _weedout.weedout)(item, excluded[i]);
            }
        }
        return item;
    }
    /**
   * Removes excluded keys from a document with populated subdocuments.
   */ filterPopulatedItem(item, options) {
        if (Array.isArray(item)) {
            return item.map((i)=>this.filterPopulatedItem(i, options));
        }
        for(let i = 0; i < options.populate.length; i++){
            if (!options.populate[i].path) {
                continue;
            }
            const model = this.excludedMap.get(options.modelName)?.model;
            if (!model) {
                continue;
            }
            const excluded = this.getExcluded({
                access: options.access,
                modelName: (0, _detective.detective)(model, options.populate[i].path)
            });
            if (hasProperty(item, options.populate[i].path)) {
                this.filterItem(getProperty(item, options.populate[i].path), excluded);
            } else {
                const pathToArray = options.populate[i].path.split(".").slice(0, -1).join(".");
                if (hasProperty(item, pathToArray)) {
                    const array = getProperty(item, pathToArray);
                    const pathToObject = options.populate[i].path.split(".").slice(-1).join(".");
                    if (Array.isArray(array)) {
                        this.filterItem(// @ts-expect-error this is fine 🐶🔥
                        array.map((element)=>getProperty(element, pathToObject)), excluded);
                    }
                }
            }
        }
        return item;
    }
    /**
   * Removes excluded keys from a document.
   */ filterObject(resource, options) {
        const excluded = this.getExcluded({
            access: options.access,
            modelName: options.modelName
        });
        const filtered = this.filterItem(resource, excluded);
        if (options?.populate) {
            this.filterPopulatedItem(filtered, {
                access: options.access,
                modelName: options.modelName,
                populate: options.populate
            });
        }
        return filtered;
    }
    constructor(){
        _define_property(this, "excludedMap", new Map());
    }
}
