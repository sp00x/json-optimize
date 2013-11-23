# JsonOptimize (json-optimize)

Optimize ("pack") certain JSON documents for size by analyzing key frequency, and replacing key names with shorter ones. Corresponding function to restore the original document ("unpack"). 

Obviously this does not always produce smaller documents, but for some cases keys are repeated several times in an array or hierarchical structure it *can* help.

( But why not MsgPack? Because I wanted to write this as an exercise :P )

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