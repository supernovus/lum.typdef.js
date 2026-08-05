import {
  cp, dp, dps, initItem, isTypItem, isTypList, isTypOpts, lock, lockWith,
  populate, RM_ARR, RM_MAP, TDS, TOS, TypOpts, setupOpts,
} from './base.js';
import { cloneItems, findType } from './methods.js';
export { TypOpts }

// Default options.
const DEF_OPTS = {
  dataKey: 'data',
  keyProps: true,
  labelKey: 'label',
}

// Key for private storage while setting up opts.
const SO = Symbol('TypDef:Opts:Setup');

/**
 * Create a TypDef list object.
 * 
 * @param {object} [opts] Options.
 * 
 * If the first arguments are objects tagged using `TypOpts()`, 
 * they will used as options. Later options will override earlier ones,
 * except for `setupItem` and `setupList`, which are additive arrays.
 * 
 * The first non-tagged argument will be the start of the `items`.
 * 
 * @param {object} [opts.clone] Options specifically for list.clone();
 * only used if other TypDefList objects are passed as `items`.
 * 
 * The actual options passed to the clone() method will compose both `opts`,
 * and `opts.clone`; the latter always take precedence.
 * 
 * @param {?string} [opts.dataKey='data'] Key for item metadata property;
 * set to null or an empty string to not use a metadata object at all.
 * 
 * If a property with this key is not explicitly set on an item definition
 * object, or the property value is not an object, an empty object will be
 * assigned for the storage of item metadata.
 * 
 * @param {boolean} [opts.findExact=false] See the findType() method.
 * 
 * @param {number} [opts.firstVal] First value?
 * 
 * If this is not specified, the default will be `1` if `opts.flags` is true,
 * or `0` if `opts.flags` is false.
 * 
 * @param {boolean} [opts.flags=false] Use bit flags?
 * 
 * If this is true then the `val` assigned to each type will be bitwise
 * flags starting with `opts.firstVal` (e.g. `1, 2, 4, 8, ...`).
 * 
 * If this is false then the `val` will be incrementing integers starting
 * with `opts.firstVal` (e.g. `1, 2, 3, 4, ...`).
 * 
 * @param {boolean} [opts.keyMap] Add a `byKey` Map?
 * 
 * If this is true, a Map indexed by `item.key` will be added.
 * 
 * This defaults to `!opts.keyProps` to ensure there is always some
 * reference to the keys available. You can manually set it to true if
 * you want both.
 * 
 * There is nothing stopping you from setting both to false, but why?
 * 
 * @param {boolean} [opts.keyProps=true] Add keys directly as properties?
 * 
 * If this is true then each `typeDef.key` will be added to the list object
 * as a property. 
 * 
 * In the case of key names that would overwrite existing properties or 
 * methods of the Array, they will be *ignored* if `opts.keyMap` is true;
 * if `opts.keyMap` is false however, they will be considered duplicate keys,
 * and a RangeError will be thrown!
 * 
 * This defaults to true as being able to do `typedef.KeyName` is simpler
 * than `typedef.byKey.get('KeyName')` for quick comparisons.
 * 
 * @param {?string} [opts.labelKey='label'] Key for item label property;
 * set to null or an empty string to not use a label at all.
 * 
 * If a string property with this key is not explicitly set on an item
 * definition object, then a default will be assigned using the `key` value.
 * 
 * @param {(function|function[])} [opts.setupItem] Setup each TypDef _item_;
 * will be an additive array in compiled options.
 * @param {(function|function[])} [opts.setupList] Setup the TypDef _list_;
 * will be an additive array in compiled options.
 * 
 * @param {boolean} [opts.valMap] Add a `byVal` Map?
 * 
 * If this is true, a Map indexed by `item.val` will be added.
 * 
 * This defaults to `!!opts.firstVal`, so that if you use `opts.flags`,
 * or otherwise change `opts.firstVal` so that its indexes might not match
 * the `item.val` values, you still have a way to look up items by value.
 * 
 * @param {...(TypDefList|TypDefItem)} [items] Item definitions.
 * 
 * The items must at the very least have a string `key` property.
 * They should NOT specify `val`, as that is assigned automatically.
 * 
 * If any TypDefList objects are passed as items, their existing items will
 * be cloned and added to the new TypDefList being created.
 * 
 * If no TypDef items are specified, but options were, then a bound version
 * of the TypDef function using those options as defaults will be returned.
 * 
 * If no TypDef items, nor options were passed, a RangeError will be thrown.
 * 
 * @returns {(TypDefList|function)} Depends on `opts` and `items` arguments.
 * @throws {TypeError}
 * @throws {RangeError}
 */
export function TypDef(...items) {
  let data = {};
  let opts = {
    ...DEF_OPTS,
    [SO]: { item: [], list: [], src: 0 },
  }

  // Handle options.
  while (items.length && isTypOpts(items[0])) {
    let to = items.shift();
    cp(opts, to);
    setupOpts(to.setupItem, opts[SO].item);
    setupOpts(to.setupList, opts[SO].list);
    opts[SO].src += to[TOS];
  }
  // Now finalise the setup options.
  dps(opts, {
    setupItem: { value: opts[SO].item },
    setupList: { value: opts[SO].list },
  });
  opts[TOS] = opts[SO].src;
  delete opts[SO];

  if (!items.length) {
    if (opts[TOS]) {
      return TypDef.bind(null, opts);
    }
    else {
      throw new RangeError('No TypDef items specified');
    }
  }

  let list = [];
  let info = dps({
    curVal: ((typeof opts.firstVal === 'number')
      ? opts.firstVal
      : (opts.flags ? 1 : 0)),
    index: null,
  }, {
    data: { value: data },
    items: { value: items },
    list: { value: list },
  });

  // A few default option values based on other options.
  if (typeof opts.keyMap !== 'boolean') {
    opts.keyMap = !opts.keyProps;
  }
  if (typeof opts.valMap !== 'boolean') {
    opts.valMap = !!info.curVal;
  }

  dps(list, {
    [TDS]: { value: data },
    [TOS]: { value: opts },
    clone: { value: cloneItems },
    findType: { value: findType },
  });

  if (opts.keyMap) {
    dp(list, 'byKey', { value: new Map() });
  }

  if (opts.valMap) {
    dp(list, 'byVal', { value: new Map() });
  }

  lockWith(RM_ARR, opts.setupList);
  for (let init of opts.setupList) {
    init.call(list, list, opts, info);
  }

  lockWith(RM_ARR, opts.setupItem);
  lock(opts);
  let cloneOpts = cp({}, opts, opts.clone);

  info.index = 0;
  for (let item of items) {
    if (isTypList(item)) { // Another TypDef list object.
      let children = item.clone(cloneOpts);
      info.subList = { children, item, index: 0 }
      for (let child of children) {
        child = initItem(child, opts, info);
        populate(list, child, opts, info);
        info.subList.index++;
      }
      delete info.subList;
    }
    else { // A regular item definition.
      item = initItem(item, opts, info);
      populate(list, item, opts, info);
    }
    // Increment the index.
    info.index++;
  }

  // Finalise the list and any maps, and return it.
  if (list.byVal) lockWith(RM_MAP, list.byVal);
  if (list.byKey) lockWith(RM_MAP, list.byKey);
  return lockWith(RM_ARR, list);
}

dp(TypDef, 'Opts', { value: TypOpts });

export default TypDef;

/**
 * An individual item in a TypDef list.
 * 
 * In addition to the properties shown in these docs, any additional
 * properties may be added as needed when creating the TypDef.
 * 
 * Functions passed in the `setupItem` option may add additional properties.
 * Functions passed in the `setupList` option may add to `opts.setupItem`.
 * 
 * @typedef {object} TypDefItem
 * 
 * @prop {string} key - Mandatory unique key.
 * 
 * A TypeError will be thrown if this is not specified.
 * 
 * @prop {number} val - Numeric value; assigned automatically.
 * 
 * You cannot specify this manually, and if this property exists
 * in a def passed to the TypDef function, it will be ignored and
 * overwritten by the auto-generated value.
 * 
 */

/**
 * A TypDef list is similar to an Enum, but with more metadata.
 * 
 * It is represented as a read-only Array of item objects, but with
 * extra properties added to the object.
 * 
 * Note that any Map properties added will also be read-only.
 * 
 * @typedef {Array<TypDefItem>} TypDefList
 * @prop {object} [TDS] List metadata object.
 * @prop {object} [TOS] Options passed to TypDef().
 * @prop {?Map<number, TypDefItem>} byVal - An index by numeric value.
 * See TypDef() for info on when this property is omitted.
 * @prop {?Map<string, TypDefItem>} byKey - An index by descriptive key.
 * See TypDef() for info on when this property is omitted.
 * @prop {function} clone - Returns an Array with a shallow clone of each
 * item. Generally used to make a TypDef that extends another TypDef.
 * @prop {function} findType - TODO: document this.
 */

/**
 * Setup function for each TypDef _item_ object.
 * @callback TypDefItemSetup
 * @param {TypDefItem} item - The current item being setup.
 * @param {object} opts - Resolved/compiled TypDef() options; locked.
 * @param {object} info - Setup info object.
 * @param {number} info.curVal - Current `val` to be assigned to item.
 * @param {object} info.data - List metadata.
 * @param {number} info.index - Item index/offset (starts at 0).
 * @param {(TypDefItem|TypDefList)[]} info.items - The full list of items.
 * @param {TypDefList} info.list - The TypDef list being created.
 * @param {object} [info.subList] Sublist definition;
 * only used when `info.items[info.index]` is a TypDefList object rather
 * than an item definition object or item key string.
 * @param {TypDefItem[]} [info.subList.children] Cloned list children.
 * @param {TypDefList} [info.subList.item] The TypDefList passed as an item.
 * @param {number} [info.subList.index] Current subList.children item index.
 * @returns {void}
 */

/**
 * Setup function for a TypDef _list_ object.
 * @callback TypDefListSetup
 * @param {TypDefList} list - The list being created.
 * @param {object} opts - Resolved/compiled TypDef() options.
 * 
 * List setup functions MAY add/change options. They CANNOT change the
 * `opts.setupList` array, as it is locked prior to them being called.
 * They MAY use `opts.setupItem.push(fun)` to register associated item setup
 * functions, as those won't be called until TypDef() starts processing items, 
 * which won't happen until all list setup functions have been completed.
 * 
 * @param {object} info - Setup info object.
 * @param {number} info.curVal - The initial `val` that will be used.
 * @param {object} info.data - List metadata.
 * @param {(TypDefItem|TypDefList)[]} info.items - The full list of items.
 * @returns {void}
 */
