import Tests from '@lumjs/tests';
import { TypDef, TypOpts } from '../lib/index.js';
import { isTypItem } from '../lib/base.js';
import { mixCase } from '../lib/tests.js';

const plan = 19;
const t = Tests.new({ module: import.meta, plan });

const OK = ' exists';
const NO = ' is undefined';
const K1 = 'HelloWorld';
const K2 = 'AfterAll';
const K3 = 'SaySomething';
const K4 = 'EverythingIsAwesome';
const K5 = 'lowlowlow';
const K6 = 'GOINGUP';

function runTest(name, opts, key) {
  let lkey = key.toLowerCase();
  let ukey = key.toUpperCase();
  let mkey = mixCase(key);
  let tn = `[${name}] `;
  let td = TypDef(TypOpts(opts), K1, K2, K3, K4);
  
  t.ok(isTypItem(td[key]), tn+key+OK);

  if (opts.keyLower) {
    t.is(td[lkey], td[key], tn+lkey+OK);
  }
  else {
    t.is(td[lkey], undefined, tn+lkey+NO);
  }

  if (opts.keyUpper) {
    t.is(td[ukey], td[key], tn+ukey+OK);
  }
  else {
    t.is(td[ukey], undefined, tn+ukey+NO);
  }

  if (opts.keyLower || opts.keyUpper) {
    t.is(td.findType(mkey), td[key], tn+`findType(${mkey})`);
  }
  else {
    t.is(td.findType(key), td[key], tn+`findType(${key}) is sane`);
    t.is(td.findType(mkey), null, tn+`findType(${mkey}) is null`);
  }
}

runTest('default opts', {}, K1);
runTest('keyLower on', { keyLower: true }, K2);
runTest('keyUpper on', { keyUpper: true }, K3);
runTest('both on', { keyLower: true, keyUpper: true }, K4);

function testNoDups(name, opts) {
  let tn = `[${name}] `;
  let td;
  let build = () => {
    td = TypDef(TypOpts(opts), K5, K6);
  }

  t.lives(build, tn+'lives');
}

testNoDups('keyLower on', { keyLower: true });
testNoDups('keyUpper on', { keyUpper: true });

t.done();
export default t;
