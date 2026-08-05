# lum.typdef.js

TypDef is a cousin to the Enum system from [@lumjs/core]. It can do pretty much
everything that Enum can, but TypDef items can contain properties, methods, and
generally are just a lot more flexible than Enum values.

## Exports

### @lumjs/typdef

- `TypDef`: The primary function for creating TypDef lists;
  is also the _default_ export.
- `TypOpts`: A function for declaring options for TypDef();
  also available as `TypDef.Opts()`.

### @lumjs/typdef/base

A bunch of functions and other values that might be useful for making 
extensions. Read the source for details.

### @lumjs/typdef/dom

- `TypDOM`: An extension that adds features designed to manage
  a collection of elements representing each item in a TypDef.
- `TypDef`: An alias to the function from the main module.

There's also a bunch of utility functions that are used internally
by the TypDOM extension that are exported in case they might be useful
elsewhere. Read the source for details.

## Example Usage

This example is designed to show off a bunch of stuff at once:
- The syntax of the TypDef() function.
- Using TypOpts() (via its TypDef.Opts() alias) to register an extension.
- How to create TypDOM elements for each item dynamically using a function.

```js
import { TypDef, TypDOM } from '@lumjs/typdef/dom';
  
const MyType = TypDef(
  TypDef.Opts(TypDOM),
  { key: 'First' },
  { key: 'Next' },
  { key: 'Last' },
);

// Now lets create <li> elements for each item.
let elems = MyType.domElements((item) => {
  let elem = document.createElement('li');
  elem.id = 'MyType-'+(item.val+1);
  elem.innerText = item.label;
  item.data.elem = elem; // Just for this example
  return elem;
});

// Finally we're going to append the items to a <menu/> element.
let typeList = document.getElementById('Type-List');
typeList.append(...elems);
```

With that example, if one was to request `typeList.outerHTML`:

```html
<menu id="Type-List">
  <li id="MyType-1">First</li>
  <li id="MyType-2">Next</li>
  <li id="MyType-3">Last</li>
</menu>
```

For a few more examples, see the files in the `test` folder.

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.typdef.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/typdef)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

---

[@lumjs/core]: https://github.com/supernovus/lum.core.js

