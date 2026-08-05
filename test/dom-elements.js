import '@happy-dom/global-registrator/register.js';
import Tests from '@lumjs/tests';
import { TypDef, TypDOM } from '../lib/dom.js';

const plan = 4;
const t = Tests.new({ module: import.meta, plan });

// Gonna make a wrapped version of TypDef that enables TypDOM by default.
const TypDom = TypDef(
  TypDef.Opts(TypDOM)
);

t.isa(TypDom, 'function', 'TypDef(TypOpts(TypDOM)) returned function');

let td = TypDom(
  'Start',
  { key: 'Next', data: { note: 'Hi' } },
  { key: 'Last', label: 'The End' },
);

t.isa(td.domElements, 'function', 'td.domElements() exists');

let elems = td.domElements((item) => {
  let elem = document.createElement('li');
  let note = item.data.note;
  elem.id = `t-${item.key}-${item.val+1}`;
  elem.innerText = item.label + (note ? ` (${note})` : '');
  item.data.elem = elem; // Just for this example
  return elem;
});

t.is(elems.length, 3, 'elems.length');

let list = document.createElement('ul');
list.append(...elems);

let html = '<ul><li id="t-Start-1">Start</li>';
html += '<li id="t-Next-2">Next (Hi)</li>';
html += '<li id="t-Last-3">The End</li></ul>';
t.is(list.outerHTML, html, 'list.outerHTML');

t.done();
export default t;
