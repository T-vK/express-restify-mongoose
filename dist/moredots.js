"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "moredots", {
    enumerable: true,
    get: function() {
        return moredots;
    }
});
const _lodashisplainobject = /*#__PURE__*/ _interop_require_default(require("lodash.isplainobject"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function moredots(src, dst = {}, prefix = "") {
    for (const [key, value] of Object.entries(src)){
        if ((0, _lodashisplainobject.default)(value)) {
            moredots(value, dst, `${prefix}${key}.`);
        } else {
            dst[`${prefix}${key}`] = value;
        }
    }
    return dst;
}
