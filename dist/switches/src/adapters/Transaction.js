"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class Convert {
    static toTransaction(json) {
        return cast(JSON.parse(json), a(r('Transaction')));
    }
    static transactionToJson(value) {
        return JSON.stringify(uncast(value, a(r('Transaction'))), null, 2);
    }
}
exports.Convert = Convert;
function invalidValue(typ, val) {
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}
function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        var map = {};
        typ.props.forEach((p) => (map[p.json] = { key: p.js, typ: p.typ }));
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        var map = {};
        typ.props.forEach((p) => (map[p.js] = { key: p.json, typ: p.typ }));
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps) {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val);
    }
    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        var l = typs.length;
        for (var i = 0; i < l; i++) {
            var typ = typs[i];
            try {
                return transform(val, typ, getProps);
            }
            catch (_) { }
        }
        return invalidValue(typs, val);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases, val);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue('array', val);
        return val.map(el => transform(el, typ, getProps));
    }
    function transformDate(typ, val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue('Date', val);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            return invalidValue('object', val);
        }
        var result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps);
            }
        });
        return result;
    }
    if (typ === 'any')
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val);
    }
    if (typ === false)
        return invalidValue(typ, val);
    while (typeof typ === 'object' && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
    if (typeof typ === 'object') {
        return typ.hasOwnProperty('unionMembers')
            ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty('arrayItems')
                ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty('props')
                    ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== 'number')
        return transformDate(typ, val);
    return transformPrimitive(typ, val);
}
function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function a(typ) {
    return { arrayItems: typ };
}
function u(...typs) {
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props, additional };
}
function m(additional) {
    return { props: [], additional };
}
function r(name) {
    return { ref: name };
}
const typeMap = {
    Transaction: o([
        { json: 'transaction_id', js: 'transactionID', typ: 0 },
        { json: 'parent_id', js: 'parentID', typ: u(0, null) },
        { json: 'order_id', js: 'orderID', typ: 0 },
        { json: 'payment_id', js: 'paymentID', typ: 0 },
        { json: 'txn_id', js: 'txnID', typ: '' },
        { json: 'parent_txn_id', js: 'parentTxnID', typ: '' },
        { json: 'txn_type', js: 'txnType', typ: u(undefined, r('TxnType')) },
        { json: 'is_closed', js: 'isClosed', typ: 0 },
        { json: 'additional_information', js: 'additionalInformation', typ: u(a(''), null) },
        { json: 'created_at', js: 'createdAt', typ: '' },
        { json: 'child_transactions', js: 'childTransactions', typ: a(r('Transaction')) },
        { json: 'extension_attributes', js: 'extensionAttributes', typ: u(r('ExtensionAttributes'), null) }
    ], false),
    ExtensionAttributes: o([], false),
    TxnType: ['payment', 'order', 'authorization', 'capture', 'void', 'refund']
};
//# sourceMappingURL=Transaction.js.map