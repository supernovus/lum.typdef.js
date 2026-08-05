/**
 * Some basic utility functions used by TypDef.
 * Useful if you are extending its functionality.
 * @module @lumjs/typdef/base
 */

/** Alias for Object.assign */
export const cp = Object.assign;
/** Alias for Object.defineProperty */
export const dp = Object.defineProperty;
/** Alias for Object.defineProperties */
export const dps = Object.defineProperties;
/** Alias for Object.freeze */
export const lock = Object.freeze;

/** List of methods to override on locked/frozen Array objects. */
export const RM_ARR = [
  'copyWithin', 'fill', 'pop', 'push', 'reverse',
  'shift', 'sort', 'splice', 'unshift',
];
/** List of methods to override on locked/frozen Map objects. */
export const RM_MAP = [
  'clear', 'delete', 'getOrInsert', 'getOrInsertComputed', 'set'
];

/** Symbol for TypDef metadata. */
export const TDS = Symbol('TypDef:Data');
/** Symbol for TypDef options. */
export const TOS = Symbol('TypDef:Opts');

/**
 * Return an object tagged as options for TypDef().
 * 
 * Also exported from main package module, and as `TypDef.Opts`.
 * 
 * @param {(object|function)} opts - Options for TypDef().
 * 
 * If this is a function instead of an object, it will be used as
 * a `opts.setupList` option value, used to register extensions.
 * 
 * If this is a TypDefList object, a copy of its internal opts will
 * be used as the options.
 * 
 * Any other object will be used directly as the options and will
 * be marked as an TypOpts object.
 * 
 * @param {boolean} [configurable=false] Should the property identifying
 * the object as TypOpts be configurable after the fact?
 * 
 * If you set this to true then the Symbol property will be able to be
 * deleted, or have its value modified using Object.defineProperty().
 * 
 * The default is false as there's usually no reason to change it.
 * 
 * @returns {object} `opts` after marking them as TypOpts
 */
export function TypOpts(opts = {}, configurable = false) {
  if (typeof opts === 'function') {
    opts = { setupList: [opts] }
  }
  else if (isTypList(opts)) {
    opts = cp({}, opts[TOS]);
  }
  return dp(opts, TOS, { configurable, value: 1 });
}

/**
 * Initialise TypDef item objects.
 * @protected
 * @param {(object|string)} item - The TypDef item object.
 * 
 * If this is a string it will be used as the `key` property for 
 * an automatically generated item object.
 * 
 * @param {object} opts
 * @param {object} info
 * @returns {object} The item after all processing.
 * @throws {TypeError} If `item` or `item.key` are not valid values.
 */
export function initItem(item, opts, info) {
  if (typeof item === 'string') { // Shortcut item.
    item = { key: item }
  }
  else { // Regular item must be validated.
    if (!item || typeof item !== 'object') {
      console.error({ item, opts, ...info });
      throw new TypeError("invalid item definition");
    }
    if (typeof item.key !== 'string') {
      console.error({ item, opts, ...info });
      throw new TypeError("item missing 'key' property");
    }
  }

  if (opts.flags) {
    item.val = info.curVal;
    info.curVal *= 2;
  }
  else {
    item.val = info.curVal++;
  }

  let dk = opts.dataKey;
  if (dk && (!item[dk] || typeof item[dk] !== 'object')) {
    item[dk] = {};
  }

  let lk = opts.labelKey;
  if (lk && typeof item[lk] !== 'string') {
    item[lk] = item.key;
  }

  for (let init of opts.setupItem) {
    init.call(info.list, item, opts, info);
  }

  return item;
}

/**
 * Is a value a function (a `typeof` test as a closure).
 * @param {mixed} v - Value to test.
 * @returns {boolean}
 */
export const isFun = (v) => (typeof v === 'function');

/**
 * See if a value is a TypDefItem object.
 * @param {mixed} v - Value to test.
 * @param {boolean} [ko=false] Test for key only?
 * 
 * If this is set to true then the test will pass on any
 * object that has a string property called `key`.
 * 
 * If this is false (default), then the object must also
 * have a number property called `val`.
 * 
 * @returns {boolean}
 */
export const isTypItem = (v, ko = false) => (v
  && typeof v === 'object'
  && typeof v.key === 'string'
  && (ko || typeof v.val === 'number')
);

/**
 * See if a value is a TypDefList object.
 * @param {mixed} v - Value to test.
 * @returns {boolean}
 */
export const isTypList = (v) => (v
  && Array.isArray(v)
  && typeof v[TDS] === 'object'
  && typeof v[TOS] === 'object'
);

/**
 * See if a value is a TypOpts object.
 * @param {mixed} v - Value to test.
 * @returns {boolean}
 */
export const isTypOpts = (v) => (v
  && typeof v === 'object'
  && typeof v[TOS] === 'number'
)

/**
 * Locks a particular type of object, disabling specific methods.
 * 
 * After the specified methods have been replaced with the `readOnly` value,
 * the object will be locked from further modifications via Object.freeze().
 * 
 * @param {string[]} meths - A list of methods to disable.
 * @param {object} obj - Object to lock.
 * @returns {object} `obj`
 */
export function lockWith(meths, obj) {
  for (let meth of meths) {
    dp(obj, meth, { value: readOnly });
  }
  return lock(obj);
}

/**
 * Populate the list (and any active maps) with an item.
 * @protected
 * @param {TypDefList} list
 * @param {TypDefItem} item
 * @param {object} opts
 * @param {object} info
 * @returns {void}
 */
export function populate(list, item, opts, info) {
  // Add the item, after locking it.
  list.push(lock(item));

  if (list.byVal) {
    list.byVal.set(item.val, item);
  }

  if (list.byKey) {
    if (list.byKey.has(item.key)) {
      console.error({ byVal, list, typeDef: item, opts });
      throw new RangeError(`'${item.key}' already exists in byKey map`);
    }
    list.byKey.set(item.key, item);
  }

  if (opts.keyProps) {
    if (list[item.key] === undefined) {
      dp(list, item.key, { value: item });
    }
    else if (!list.byKey) {
      console.error({ list, typeDef: item, opts });
      throw new RangeError(`'${item.key}' list property already exists`);
    }
  }
}

/**
 * A replacement for methods that are disabled using `lockWith()`.
 * 
 * This simply outputs some debugging info to the console,
 * then throws an error indicating you attempted to modify a readonly object.
 */
export function readOnly() {
  console.error(this, arguments);
  throw new RangeError("cannot call mutating method on readonly object");
}

/**
 * Handle additive array options.
 * @protected
 * @param {mixed} vals - Value(s) to add to additive list.
 * 
 * This may be an Array of values, or a single value. If the value itself
 * needs to be an Array, you would need to pass it as a nested array.
 * 
 * If this is `undefined`, the function will return immediately with no
 * further processing.
 * 
 * @param {Array} list - The additive list option being populated.
 * @param {boolean} [dups=false] Allow duplicate values?
 * @param {function} [test=isFun] Test for individual items to pass.
 * 
 * The default test is `isFun()` as the only additive options supported
 * by default are `setupList` and `setupItem`, both of which must only
 * contain functions.
 * 
 * Any value that does not pass this test will NOT be added to the list.
 * 
 * @returns {void}
 */
export function setupOpts(vals, list, dups=false, test=isFun) {
  if (vals === undefined) return;
  if (!Array.isArray(vals)) vals = [vals];
  for (let val of vals) {
    if (test(val) && (dups || !list.includes(val))) {
      list.push(val);
    }
  }
}
