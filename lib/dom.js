/**
 * Utilities specific to working with DOM Nodes and Elements.
 * Also re-exports `TypDef` function for convenience.
 * @module @lumjs/typdef/dom
 */

import { dp, TDS, TOS } from './base.js';
import { TypDef, TypOpts } from './index.js';
export { TypDef, TypOpts }

/**
 * See if a value is an iterable object that contains *only* `Node` items.
 * 
 * Meant to work with Array, Set, or any other iterable object where you can
 * iterate over the values directly. It DOES NOT work with Map objects, as
 * they iterate over _pair_ array items (which contain both key and value).
 * 
 * @param {mixed} v - Value to test.
 * @returns {boolean}
 */
export function iterableNodes(v) {
  if (!v 
    || typeof v !== 'object' 
    || typeof v[Symbol.iterator] !== 'function') {
    return false;
  }

  for (let i of v) {
    if (!(i instanceof Node)) { 
      return false;
    }
  }

  return true;
}

/**
 * Is a value an Element, HTMLCollection, NodeList, or iterable nodes?
 * 
 * Checks for instances of the specific classes first, and if none of them
 * are true, falls back on the iterableNodes() test.
 * 
 * @param {mixed} v - Value to test.
 * @returns {boolean}
 */
export function containsNodes(v) {
  return (v instanceof Element
    || v instanceof HTMLCollection
    || v instanceof NodeList
    || iterableNodes(v)
  );
}

/**
 * A collection of elements or other DOM nodes.
 * @typedef {(Element|HTMLCollection|NodeList|Node[]|Set<Node>)} NodeContainer
 */

/**
 * Clone an entire collection of elements (deep cloning).
 * @param {NodeContainer} elems
 * 
 * Note if this is a single `Element`, the Element itself will NOT be cloned,
 * only it's children will be! If you want a single Element, pass an Array
 * with just that element in it. Although seriously, if you just want a clone
 * of a single element, just call `elem.cloneNode(true)` directly.
 * 
 * @returns {Node[]} Array of cloned elements and other DOM nodes.
 */
export function cloneElements(elems) {

  if (elems instanceof HTMLCollection || elems instanceof NodeList) {
    elems = Array.from(elems);
  }
  else if (elems instanceof Element) {
    elems = Array.from(elems.children);
  }
  else if (!Array.isArray(elems)) {
    console.error('invalid collection of elements', elems);
    return [];
  }

  return elems.map(el => el.cloneNode(true));
}

/**
 * Method that will be added to all lists using the TypDOM extension.
 * 
 * In any of the docs below, `opts` will refer to the options stored
 * in the TypDef list object. Those passed using TypOpts(), as well as
 * any added by extensions.
 * 
 * The method name can be set using `opts.domElementsName`; the default is
 * `domElements`. The metadata property that the elements will be stored
 * in can be set using `opts.domElementsData`; the default will be the
 * resolved value of `opts.domElementsName`.
 * 
 * @param {?(boolean|TypDefDOMElementGenerator|NodeContainer)} [arg=null]
 * This is a multi-purpose method that can be a getter or a setter depending
 * on the type of argument passed to it.
 * 
 * Getters:
 * 
 * - `null`: Will change arg value to `!!opts.domClone`; arg default.
 * - `false`: Return a container of elements directly from metadata;
 *   return value will be null if no elements have been assigned.
 * - `true`: Return array of cloned elements from metadata, via the
 *   `cloneElements()` function. The array will be empty if there are
 *   no elements assigned yet; additionally an error message may appear
 *   in the console log in that case.
 * 
 * Setters:
 * 
 * - `NodeContainer`: Set the elements metadata, replacing existing.
 * - `TypDefDOMElementGenerator`: Sets the elements metadata to a new array,
 *   populated with the result of calling the arg function once for every
 *   item in the underlying TypDef list object.
 * 
 * @returns {?NodeContainer}
 * 
 * The NodeContainer will be returned if one exists. That includes if you
 * called this method using one of the Setter arguments.
 * 
 */
function domElements(arg = null) {
  let pk = this[TOS].domElementsName ?? 'domElements';
  let dk = this[TOS].domElementsData ?? pk;

  if (arg === null) {
    arg = !!(this[TOS].domClone);
  }

  if (arg === false) {
    return this[TDS][dk];
  }
  if (arg === true) {
    return cloneElements(this[TDS][dk]);
  }

  if (typeof arg === 'function') {
    let elems = this[TDS][dk] = [];
    let meta = {data: this[TDS], elems, index: 0, list: this};
    for (let item of this) {
      let elem = arg.call(this, item, this[TOS], meta);
      if (elem instanceof Element) {
        elems.push(elem);
      }
      else if (elem !== null) {
        console.error({item, elem, meta, arg});
        throw new TypeError(`Invalid return value from ${pk} function`);
      }
      meta.index++;
    }
  }
  else if (containsNodes(arg)) {
    this[TDS][dk] = arg;
  }
  else {
    console.error({arg, data: this[TDS], list: this});
    throw new TypeError(`Invalid ${pk} argument`);
  }

  return this[TDS][dk];
}

/**
 * A TypDef extension that if incldued in `opts.setupList`, will add special
 * properties that can be used to get or set a collection of DOM Elements
 * representing each item in a TypDef list.
 * 
 * See the README file and tests for examples of how to use this extension.
 */
export function TypDOM(list, opts) {
  let configurable = opts.domConfigurable ?? false;
  let pk = opts.domElementsName ?? 'domElements';
  dp(list, pk, { configurable, value: domElements });
}

/**
 * A function to generate elements from TypDef items.
 * @callback TypDefDOMElementGenerator
 * @this {TypDefList}
 * @param {TypDefItem} item - The item to make an Element for.
 * @param {object} opts - Options passed to TypDef().
 * @param {object} info - Additional properties.
 * @param {object} info.data - List metadata.
 * @param {Array} info.elems - Elements already created.
 * @param {number} info.index - Item index/offset (starts at 0).
 * @param {TypDefList} info.list - The TypDef list the elements are from.
 * @returns {?Element} An Element representing the item, or null if the item
 * should not be represented, or is invalid. 
 * 
 * Element return values will be added to the array, null will be ignored,
 * anything else is invalid and will result in a TypeError being thrown.
 */
