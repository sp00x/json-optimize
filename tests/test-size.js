//require('look').start(3000, '127.0.0.1');

var format = new require('format-number')();
var sprintf = require('sprintf');
var zlib = require('zlib');
var fs = require('fs');
var msgpack = require('msgpack');
var JsonOptimize = require('../src/json-optimize');

var jo = new JsonOptimize();

var fn = process.argv[2];

if (fn == null)
{
  fn = "tests/test-mtg-data.json";

  if (fs.existsSync(fn))
    runTests();
  else
  {
    var url = "http://mtgjson.com/json/AllSets.json";

    var http = require('http');
    var fs = require('fs');

    console.log("downloading " + url + " -> " + fn + "..");
    var file = fs.createWriteStream(fn);
    var request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function()
      {
        console.log("downloaded");
        runTests();
      });
    });
  }
}
else
  runTests();

function runTests()
{
  var obj = JSON.parse(fs.readFileSync(fn));

  //console.log("press ENTER to start..")
  //process.stdin.resume();
  //var response = fs.readSync(process.stdin.fd, 100, 0, "utf8");
  //process.stdin.pause();

  var tests = [
    [ 'json' ],
    [ 'msgpack' ],
    [ 'msgpack', 'deflate' ],
    [ 'json', 'deflate' ],
    [ 'msgpack', 'gzip' ],
    [ 'json', 'gzip' ]
  ];

  var rep = [];

  function runTests(data, title)
  {
    tests.forEach(function(test)
    {
      var t0 = Date.now();

      var result = test.reduce(function(prev, task)
      {
        switch (task)
        {
          case "json-optimize":
            return jo.pack(prev);

          case "json":
            return new Buffer(JSON.stringify(prev));

          case "deflate":
            return zlib.deflateSync(prev);

            case "gzip":
              return zlib.gzipSync(prev);

          case "msgpack":
            return msgpack.pack(prev);

          default:
            return prev;
        }
      }, data);

      var t = Date.now() - t0;

      var s = sprintf("%-40s %12s b, %5d ms", test.join(" + "), format(result.length), t);
      rep.push({
        text: s,
        len: result.length,
        time: t
      });
      console.log(s);
    });
  }

  console.log("running tests..\n");
  runTests(obj, "Unoptimized");

  tests = tests.map(function(t) { return [ "json-optimize" ].concat(t) });
  runTests(obj, "Optimized");
  console.log("ran all tests.");

  rep.sort(function(a,b) { return a.len - b.len });
  console.log("\nBY SIZE:\n");
  console.log(rep.map(function(r) { return r.text }).join("\n"));

  rep.sort(function(a,b) { return a.time - b.time });
  console.log("\nBY TIME:\n");
  console.log(rep.map(function(r) { return r.text }).join("\n"));
}
