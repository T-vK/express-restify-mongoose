"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getQueryOptionsSchema", {
    enumerable: true,
    get: function() {
        return getQueryOptionsSchema;
    }
});
const _zod = require("zod");
const PopulateOptionsSchema = _zod.z.object({
    path: _zod.z.string(),
    match: _zod.z.record(_zod.z.unknown()).optional(),
    options: _zod.z.record(_zod.z.unknown()).optional(),
    select: _zod.z.string().optional(),
    // Configure populate query to not use strict populate to maintain
    // behavior from Mongoose previous to v6 (unless already configured)
    strictPopulate: _zod.z.boolean().optional().default(false)
});
const PopulateSchema = _zod.z.preprocess((value)=>{
    if (typeof value === "string") {
        if (value.startsWith("{")) {
            return JSON.parse(`[${value}]`);
        }
        if (value.startsWith("[")) {
            return JSON.parse(value);
        }
        return value;
    }
    return Array.isArray(value) ? value : [
        value
    ];
}, _zod.z.union([
    _zod.z.string(),
    _zod.z.array(PopulateOptionsSchema)
]));
const SelectSchema = _zod.z.preprocess((value)=>{
    const fieldToRecord = (field)=>{
        if (field.startsWith("-")) {
            return [
                field.substring(1),
                0
            ];
        }
        return [
            field,
            1
        ];
    };
    if (typeof value === "string") {
        if (value.startsWith("{")) {
            return JSON.parse(value);
        }
        return Object.fromEntries(value.split(",").filter(Boolean).map(fieldToRecord));
    }
    if (Array.isArray(value)) {
        return Object.fromEntries(value.map(fieldToRecord));
    }
    return value;
}, _zod.z.record(_zod.z.number().min(0).max(1)));
const SortSchema = _zod.z.preprocess((value)=>{
    if (typeof value === "string" && value.startsWith("{")) {
        return JSON.parse(value);
    }
    return value;
}, _zod.z.union([
    _zod.z.string(),
    _zod.z.record(_zod.z.enum([
        "asc",
        "desc",
        "ascending",
        "descending",
        "-1",
        "1"
    ])),
    _zod.z.record(_zod.z.number().min(-1).max(1))
]));
const LimitSkipSchema = _zod.z.preprocess((value)=>{
    if (typeof value !== "string") {
        return value;
    }
    return Number(value);
}, _zod.z.number());
function getQueryOptionsSchema({ allowRegex }) {
    const QuerySchema = _zod.z.preprocess((value)=>{
        if (!allowRegex && `${value}`.toLowerCase().includes("$regex")) {
            throw new Error("regex_not_allowed");
        }
        if (typeof value !== "string") {
            return value;
        }
        return JSON.parse(value);
    }, _zod.z.record(_zod.z.unknown())).transform((value)=>{
        return Object.fromEntries(Object.entries(value).map(([key, value])=>{
            if (Array.isArray(value) && !key.startsWith("$")) {
                return [
                    key,
                    {
                        $in: value
                    }
                ];
            }
            return [
                key,
                value
            ];
        }));
    });
    return _zod.z.object({
        query: QuerySchema.optional(),
        populate: PopulateSchema.optional(),
        select: SelectSchema.optional(),
        sort: SortSchema.optional(),
        limit: LimitSkipSchema.optional(),
        skip: LimitSkipSchema.optional(),
        distinct: _zod.z.string().optional()
    }).transform((value)=>{
        if (typeof value.populate === "undefined") {
            return value;
        }
        const populate = typeof value.populate === "string" ? value.populate.split(",").filter(Boolean).map((field)=>{
            const pop = {
                path: field,
                strictPopulate: false
            };
            if (!value.select) {
                return pop;
            }
            for (const [k, v] of Object.entries(value.select)){
                if (k.startsWith(`${field}.`)) {
                    if (pop.select) {
                        pop.select += " ";
                    } else {
                        pop.select = "";
                    }
                    if (v === 0) {
                        pop.select += "-";
                    }
                    pop.select += k.substring(field.length + 1);
                    delete value.select[k];
                }
            }
            // If other specific fields are selected, add the populated field
            if (Object.keys(value.select).length > 0 && !value.select[field]) {
                value.select[field] = 1;
            }
            return pop;
        }) : value.populate;
        return {
            ...value,
            populate
        };
    }).transform((value)=>{
        if (!value.populate || Array.isArray(value.populate) && value.populate.length === 0) {
            delete value.populate;
        }
        if (!value.select || Object.keys(value.select).length === 0) {
            delete value.select;
        }
        return value;
    });
}
