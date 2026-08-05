import Tests from '@lumjs/tests';
import { TypDef, TypOpts } from '../lib/index.js';

const plan = 17;
const t = Tests.new({ module: import.meta, plan });
const bid = 'B(a)b(e|y)';
const eid = 'Eeee!';
const fid = 'Ffuuu...';
const lp = '«';
const ls = '»';

// First source dataset using default options.
let td1 = TypDef(
  { key: 'Aa', data: { isFirst: true } },
  { key: 'Bb', label: bid },
  { key: 'Cc', data: { isLast: true } },
);

// Second source dataset using custom options.
let td2 = TypDef(
  TypOpts({ dataKey: 'meta', labelKey: 'name' }),
  { key: 'Dd', meta: { isFirst: true } },
  { key: 'Ee', name: eid },
  { key: 'Ff', txt: fid },
);

t.is(td2[0].name, 'Dd', 'td2[0].name');
t.isa(td2[1].meta, 'object', 'td2[1].meta');
t.is(td2[2].name, 'Ff', 'td2[2].name');
t.is(td2[2].txt, fid, 'td2[2].txt');

// Third dataset build using the two sources.
let clone = {labelPrefix: lp, labelSuffix: ls};
let td3 = TypDef(
  TypOpts({ clone, dataKey: 'md', labelKey: 'txt' }),
  td1,
  td2,
);

t.is(td3[0].txt, lp+'Aa'+ls, 'td3[0].txt');
t.is(td3[1].txt, lp+bid+ls, 'td3[1].txt');
t.is(td3[4].txt, lp+eid+ls, 'td3[4].txt');
t.is(td3[5].txt, lp+'Ff'+ls, 'td3[5].txt');
t.is(td3[1].label, undefined, 'td3[1].label');
t.is(td3[3].name, undefined, 'td3[3].name');
t.is(td3[0].md?.isFirst, true, 'td3[0].md.isFirst');
t.is(td3[0].md?.isLast, undefined, 'td3[0].md.isLast');
t.is(td3[1].md?.isFirst, undefined, 'td3[1].md.isFirst');
t.is(td3[2].md?.isLast, true, 'td3[2].md.isLast');
t.is(td3[3].md?.isFirst, true, 'td3[3].md.isFirst');
t.is(td3[0].data, undefined, 'td3[0].data');
t.is(td3[4].meta, undefined, 'td3[4].meta');

t.done();
export default t;
