import Tests from '@lumjs/tests';
import { TypDef, TypOpts } from '../lib/index.js';
import { isTypList, isTypItem, isTypOpts, TOS } from '../lib/base.js';

const plan = 35;
const t = Tests.new({ module: import.meta, plan });

t.is(TypDef.Opts, TypOpts, 'TypDef.Opts === TypOpts');

// Default options, and placeholder 'val' properties.
let td = TypDef(
  { key: 'First', val: 42 },
  { key: 'Next', val: 69 },
  { key: 'Last', val: Infinity },
);

t.ok(isTypList(td), 'isTypList(td)');
t.is(td.length, 3, 'td.length');
t.ok(isTypItem(td[0]), 'isTypItem(td[0])');
t.is(td[0].key, 'First', 'td[0].key');
t.is(td.Last.val, 2, 'td.Last.val');
t.is(td.byKey, undefined, 'td.byKey is undefined');
t.is(td.byVal, undefined, 'td.byVal is undefined');
t.is(td[0].label, 'First', 'td[0].label');
t.isa(td[0].data, 'object', 'td[0].data is an object');

// Key-only defs, with flags and other custom options.
let to = TypOpts({ dataKey: '', flags: true, keyProps: false, labelKey: '' });
td = TypDef(
  to,
  'X',
  'W',
  'R',
);
let ti = td[2]; // One TypDefItem we will use for tests.

t.ok(isTypOpts(to), 'isTypOpts(to)');
t.isa(td.byKey, Map, 'td2.byKey is a Map');
t.isa(td.byVal, Map, 'td2.byVal is a Map');
t.is(td[0].val, 1, 'td2[0].val');
t.is(td.byVal.get(4).key, 'R', 'td2.byVal.get(n).key');
t.is(td.X, undefined, 'td2.X is undefined');
t.is(td.byKey.get('W').val, 2, 'td2.byKey.get(s).val');
t.is(td[0].label, undefined, 'td2[0].label is undefined');
t.is(td[0].data, undefined, 'td2[0].data is undefined');
t.is(td.findType('R'), ti, 'td2.findType(str)');
t.is(td.findType(4), ti, 'td2.findType(num)');
t.is(td.findType({ key: 'R' }), ti, 'td2.findType(obj)');

td = TypDef(
  to, // Re-use the previous options as defaults.
  TypOpts({ findExact: true, flags: false }), // Apply some new options.
  'A',
  td, // Include the items from the previous test.
  'Z',
);

t.is(td.length, 5, 'td3.length');
t.is(td[2].key, 'W', 'td3[2].key');
t.is(td[3].val, 3, 'td3[3].val');
t.is(td[0].label, undefined, 'td3[0].label is undefined');
t.isa(td.byKey, Map, 'td3.byKey is a Map');
t.is(td.findType(ti), null, 'td3.findType(obj) // opts.findExact');
t.is(td.findType(ti, false), td[3], 'td3.findType(obj, bool)');

// Now extract options from a TypDefList object.
let l = 'TypOpts(td)';
to = TypOpts(td);
t.is(to.flags, false, l+'.flags');
t.is(to.keyProps, false, l+'.keyProps');

to.flags = true;
t.is(to.flags, true, l+' is mutable');

// Now try working with a 'finalised' options object.
l = 'td[TOS]';
to = td[TOS];
t.is(to.flags, false, l+' is separate from clone');
t.dies(() => { to.flags = true }, l+' property assignment fails');
t.is(to.flags, false, 'td[TOS] is immutable');

t.done();
export default t;
