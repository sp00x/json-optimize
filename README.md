# JsonOptimize (json-optimize)

Optimize objects prior to JSON encoding by analyzing property names, and temporarily replacing them with shorter ones based on combined length and number of occurences. Corresponding function to restore the original object.

Obviously this does not always produce smaller documents, but for some cases where property names are repeated a lot of times in e.g. an array of similar documents it *can* help.

It's not optimized for speed or anything.

## License

MIT.

## But there's MsgPack?!

Sure, but this works well in combination with [MsgPack](http://msgpack.org/ "MsgPack") also:

Example test file:

* Original: 3 106 646
* MsgPack'ed: 2 417 832
* JsonOptimize'd: 2 161 369
* JsonOptimize'd then MsgPack'ed: 1 472 453

## Usage

### Node.js

```javascript
var fs = require('fs');
var JsonOptimize = require('json-optimize');

// read some json
var doc = JSON.parse(fs.readFileSync('junk.json'));

// create optimized document
var jo = new JsonOptimize();
var optDoc = jo.pack(doc);

// translate back to original
var origDoc = jo.unpack(optDoc);
```

### JavaScript

```html
<script type="text/javascript" src="bower_components/build/json-optimize.min.js"></script>
<script type="text/javascript">
var jo = new JsonOptimize();
var bar = ..;
var foo = jo.pack(bar);
</script>
</tt>
```

## API

### Constructor

#### new JsonOptimize([options])

`options` is an optional object with various overrides:

* `idChars`: which characters to use in ID generation (defaults: *equivalent of <strike>[\\x20-2F\x3A-7E\x20]</strike> [a-zA-Z]*). (See note on object property order below)
* `omitUndefined`: skip undefined values in the analysis process, as they will be removed by the JSON serialization anyhow (default: *true*)
* `excludeTypes`: either an array of object types to not recurse into, or a function that will be called for each value (true: exclude, false: include). (default: *[Date]*). 

### Methods

#### pack(originalObject) : optimizedObject

#### unpack(optimizedObject) : originalObject

## Implementation

The "optimized" document is basically in the form of an array with the first element being an array of the original key names, and the second element is the original document with propert names replaced.

## Tests

* `npm test` - regular sanity checks
* `npm run-script test-size` - test performance

## Notes

### Circular references

There is no protection against circular references built-in. It will most likely  go into an eternal loop, eventually blowing the call stack or running out of memory, whichever comes first. You should not be passing such objects into JSON.stringify() anyhow.

### Object property order

According to the EcmaScript specification, the order of properties in an object is not really defined, but in most implementations (including Node.js and most
browsers), the order is kept as long as the property name does not consist
of only numerals, which appear in sorted order at the "beginning" of the object.

See: [http://stackoverflow.com/a/5525812](http://stackoverflow.com/a/5525812)

I.e.: If you include '0'..'9' in the `idChars` option, do not expect property order to be preserved. But you *shouldn't expect that anyhow*.  

## Other example tests

Testing against a sample JSON file of [all sets of MTG cards](http://mtgjson.com/):

<pre>
BY SIZE:

json-optimize + json + deflate              2,523,693 b,  1016 ms
json-optimize + json + gzip                 2,523,705 b,  1084 ms
json-optimize + msgpack + deflate           2,581,704 b,  1193 ms
json-optimize + msgpack + gzip              2,581,716 b,  1204 ms
json + deflate                              2,643,561 b,   572 ms
json + gzip                                 2,643,573 b,   577 ms
msgpack + deflate                           2,720,312 b,   774 ms
msgpack + gzip                              2,720,324 b,   781 ms
json-optimize + msgpack                     8,971,927 b,   811 ms
json-optimize + json                       10,614,375 b,   712 ms
msgpack                                    11,085,630 b,   348 ms
json                                       12,727,656 b,   173 ms

BY TIME:

json                                       12,727,656 b,   173 ms
msgpack                                    11,085,630 b,   348 ms
json + deflate                              2,643,561 b,   572 ms
json + gzip                                 2,643,573 b,   577 ms
json-optimize + json                       10,614,375 b,   712 ms
msgpack + deflate                           2,720,312 b,   774 ms
msgpack + gzip                              2,720,324 b,   781 ms
json-optimize + msgpack                     8,971,927 b,   811 ms
json-optimize + json + deflate              2,523,693 b,  1016 ms
json-optimize + json + gzip                 2,523,705 b,  1084 ms
json-optimize + msgpack + deflate           2,581,704 b,  1193 ms
json-optimize + msgpack + gzip              2,581,716 b,  1204 ms

</pre>

The question obviously is: with json + deflate/gzip being this close in byte savings, and also considerably faster, is there really anything to win from this? I don't know. I had fun writing this anyhow :P
