# JsonOptimize (json-optimize)

Optimize ("pack") certain JSON documents for size by analyzing key frequency, and replacing key names with shorter ones. Corresponding function to restore the original document ("unpack"). 

Obviously this does not always produce smaller documents, but for some cases where keys are repeated a lot of times in e.g. an array of similar documents it *can* help.

It's not optimized for speed or anything.

**But there's MsgPack?!**

Sure, but this works well in combination with [MsgPack](http://msgpack.org/ "MsgPack") also:

Example test file:

* Original: 3 106 646
* MsgPack'ed: 2 417 832
* JsonOptimize'd: 2 161 369
* JsonOptimize'd then MsgPack'ed: 1 472 453

## Usage

<pre>
var FS = require('fs');
var JsonOptimize = require('json-optimize');

// read some json
var doc = JSON.parse(FS.readFileSync('junk.json'));

// create optimized document
var jo = new JsonOptimize();
var optDoc = jo.pack(doc);

// translate back to original
var origDoc = jo.unpack(optDoc);
</pre>

## API

### Constructor

#### new JsonOptimize([idChars])

### Methods

#### pack(originalObject) : optimizedObject 

#### unpack(optimizedObject) : originalObject

## Requirements

* Javascript :P

## License

TBD.