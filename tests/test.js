var isScript = (typeof require === 'function');

var JsonOptimize = isScript ? require('../src/json-optimize') : this.JsonOptimize;
var assert = isScript ? require('assert') : null;

// JSON.stringify(null) = "null"
// JSON.stringify(undefined) = undefined
// JSON.stringify([undefined]) = "[null]"
// JSON.stringify({a: undefined}) = "{}"

var jo = new JsonOptimize();

var base = [
  { t: 'null', v: null },
  { t: 'undefined', v: undefined },
  { t: 'integer', v: 1 },
  { t: 'float', v: 1.234 },
  { t: 'string', v: "a string" },
  { t: 'boolean', v: true },
  { t: 'Date', v: new Date(1980, 11, 24, 12, 34, 56, 987) },
  { t: 'Error', v: new Error("error message") },
  { t: 'Array', v: [ 1, 2, 3 ] },
  { t: 'Object', v: { foo: 'bar' } },
  { t: 'Object without properties', v: { } },
  { t: 'Object with numeric keys', v: { cccc: 1, bbbb: 2, aaaa: 3, "4": 6, "5": 5, "6": 4 } } // property order
];

// these won't work with assert.deepEquals anyhow
var base2 = [
  { t: 'NaN', v: NaN, assert: false },
  { t: 'infinity', v: Infinity, assert: false }
]

var baseBare = base.map(function(x) { return x.v } );
var base2Bare = base2.map(function(x) { return x.v } );

var deep = [
  { t: 'Array of lots of stuff', v: [ baseBare ] },
  { t: 'Object of lots of stuff', v: { foo: baseBare, bar: [ base ] } }
];

var deep2 = [
  { t: 'Array of nonequality stuff', v: [ base2Bare ], assert: false },
  { t: 'Object of nonequality stuff', v: { foo: base2Bare, bar: [ base2Bare ] }, assert: false }
];

var tests = [].concat(base, base2, deep, deep2);

if (isScript)
{
  var fn = "tests/test-mtg-data.json";
  var fs = require('fs');
  if (fs.existsSync(fn))
  {
    console.log("reading " + fn + " ..")
    tests.push({ t: 'Big JSON sample', v: JSON.parse(fs.readFileSync(fn)) });
  }
  else
    console.warn(fn + " not found, run 'npm run-script test-size' to download");
}

function len(o) { return o ? o.length : NaN; }

function test(test, i)
{
  try
  {
    console.info("\n" + test.t + "..");

    var before = test.v;

    var jsonIn = JSON.stringify(before);
    var frozen = jo.pack(before);
    var jsonTemp = JSON.stringify(frozen);
    var after = jo.unpack(frozen);
    var jsonOut = JSON.stringify(after);

    //console.info(test.t + ":       " + len(jsonIn) + " -> " + len(jsonTemp) + " (" + Math.round(100 * len(jsonTemp) / len(jsonIn)) + "%)");

    var assertError = false;

    if (test.assert && assert)
    {
      assert.deepEqual('MISMATCH!');
    }

    if (jsonIn != jsonOut)
    {
      throw new Error("MISMATCH!");
    }

    console.info("  OK");
  }
  catch (e)
  {
    console.error('  ' + e, e.stackTrace);

    if (isScript)
    {
      var fs = require('fs');
      fs.writeFileSync('tests/error-before-' + i + '.json', JSON.stringify(before, null, '  '));
      fs.writeFileSync('tests/error-json-optimize-' + i + '.json', JSON.stringify(frozen, null, '  '));
      fs.writeFileSync('tests/error-after-' + i + '.json', JSON.stringify(after, null, '  '));
    }

    console.dir(before);
    console.dir(after);

    if (isScript) process.exit(1);
  }
}

tests.forEach(function(obj, i)
{
  test(obj, i)
});

/*

// Using 0123456789 screws up order of properties

for (var i=0; 255>=i; i++)
{
  var ch = String.fromCharCode(i);

  var obj = { z: 'a', dddd: 'a', 0: 4, b: { dddd: 4 } };

  jo = new JsonOptimize({ idChars: ch });
  test(obj, ch)
}

*/

if (isScript)
{
  console.log("\nYou can do 'npm run-script test-size' for additional performance testing..")
  process.exit(0);
}
