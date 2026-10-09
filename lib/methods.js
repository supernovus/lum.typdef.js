import {
  cp, isTypItem, TOS,
} from './base.js';

/**
 * The `clone()` method added to TypDef list objects.
 * @param {object} [opts] Options for cloning.
 * @param {string} [opts.dataKey] Override `dataKey` used in cloned items.
 * If not specified, the dataKey from the original list will be used.
 * @param {string} [opts.labelKey] Override `labelKey` used in cloned items.
 * If not specified, the labelKey from the original list will be used.
 * @param {string} [opts.labelPrefix=''] Prefix to add to the label.
 * @param {string} [opts.labelSuffix=''] Suffix to add to the label.
 * @returns {Array} Array of TypDefItem objects.
 */
export function cloneItems(opts = {}) {

  let lo = this[TOS];
  let newList = [];
  let cdk = lo.dataKey;
  let clk = lo.labelKey;
  let ddk = opts.dataKey ?? cdk;
  let dlk = opts.labelKey ?? clk;
  let pf = opts.labelPrefix ?? '';
  let sf = opts.labelSuffix ?? '';

  for (let item of this) {
    let newd = cp({}, item);

    if (dlk && (clk || pf || sf)) {
      let ol = (clk && typeof item[clk] === 'string') ? item[clk] : item.key;
      newd[dlk] = pf + ol + sf;
      if (clk && (clk !== dlk)) {
        delete newd[clk];
      }
    }

    if (ddk && cdk && typeof item[cdk] === 'object') {
      newd[ddk] = cp({}, item[cdk]);
      if (cdk !== ddk) {
        delete newd[cdk];
      }
    }

    newList.push(newd);
  }

  return newList;
}

/**
 * The `findType()` method added to TypDef list objects.
 * @param {(string|number|object)} t - What to find
 * 
 * - If this is a string, we will look for an item with that `key`.
 *   If either the `keyLower` or `keyUpper` options are true, then the
 *   `exact` argument will affect if the search is case-sensitive or not.
 * - If this is a number, we will look for an item with that `val`.
 * - If this is a TypDef item object, then what we look for depends on the
 *   `exact` argument value (see below).
 * 
 * @param {?boolean} [exact=null] Should object matches be exact?
 * 
 * If this is true, and a TypDef item object is passed as `t`, then it must
 * be the **exact** item object from this TypDef list. If this is false,
 * then we will look for a TypDef item with the same `key` value.
 * 
 * This also affects whether key searches are case-sensitive or not when
 * either the `keyLower` or `keyUpper` options are true. If neither are true,
 * then key searches will be case-sensitive regardless of this value.
 * 
 * The default value of this argument if not specified is `opts.findExact`.
 * See the TypDef() function for info on setting options.
 * 
 * @returns {?object} Will be null if no matching item was found.
 */
export function findType(t, exact = null) {
  let opts = this[TOS];
  if (exact === null) exact = opts.findExact ?? false;

  if (isTypItem(t, true)) {
    if (exact) { // must be the exact object.
      return this.includes(t) ? t : null;
    }
    // check for the type key
    t = t.key;
  }

  if (typeof t === 'string') { // a key
    if (!exact) {
      if (opts.keyLower) {
        t = t.toLowerCase();
      }
      else if (opts.keyUpper) {
        t = t.toUpperCase();
      }
    }

    if (this.byKey) {
      return this.byKey.get(t) ?? null;
    }
    else if (isTypItem(this[t])) { // a property
      return this[t];
    }
    else { // loop em all
      for (let item of this) {
        if (item.key === t) {
          return item;
        }
      }
    }
    return null; // key not found
  }

  if (typeof t === 'number') {
    if (this.byVal) {
      return this.byVal.get(t) ?? null;
    }
    else if (isTypItem(this[t])) { // an index offset
      return this[t];
    }
    else { // loop em all
      for (let item of this) {
        if (item.val === t) {
          return item;
        }
      }
    }
    return null; // val not found
  }

  console.warn("invalid findType argument", t);
  return null;
}
