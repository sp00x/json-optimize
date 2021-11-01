/*! json-optimize v0.1.1 by Rune Bjerke | License: MIT | 2021-11-01 */
(function()
{
	/** Json Optimize instance
	 *
	 * @class
	 */
	function JsonOptimize(options)
	{
		options = (typeof options === 'object') ? options : {};

		// The JSON serialization behavior for object properties with
		// undefined values is to omit them, so keys with these values
		// should not go into the consideration when sorting they key
		// lengths..

		var omitUndefined = (options.omitUndefined === true);

		// The default set of characters that are used for generating the
		// shorter property names
		//
		// ATTENTION! The order of properties in an object is not really defined
		// in ES5, but Node.js and most browsers behave like:
		//
		//    1. property names consisting only of digits, sorted
		//    2. property names as they are listed or added to the object
		//
		// Therefore, using '0'..'9' in $(idChars) is generally a bad idea if
		// you expect the same object out of unpack() that you sent in to pack()

		var idChars = options.idChars;
		if (idChars == null || typeof idChars != 'string')
		{
			// apparently this gives worse performance with gzip/deflate..
			/*
			idChars = "";
			for (var i=33; 127>i; i++)
			{
				if (i >= 48 && i <= 57) continue; // skip '0'..'9'
				idChars += String.fromCharCode(i);
			}
			idChars += ' ';
			*/

			idChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		}

		// You don't want to try to JSON serialize an object containing
		// these types anyhow, but some of them have special default handling
		// in JSON.stringify(), e.g. Date

		var excludeTypes = options.excludeTypes || [ Date ];

		// Check if the supplied object is an instance of something
		// in the excludeTypes array

		function defaultExclude(o)
		{
			return !excludeTypes.every(function(c)
			{
				return !(o instanceof c);
			})
		}

		// Shortcut for later - either the default function, or a user-supplied
		// function

		var exclude;
		if (typeof excludeTypes === 'function')
		{
			exclude = excludeTypes;
			excludeTypes = []; // just in case
		}
		else
		{
			exclude = defaultExclude;
			if (! excludeTypes instanceof Array)
				throw new Error("options.excludeTypes must either be an array of types, or a function");
		}

		/** Converts a number to base N where N is the number of chars in the
		 * idChars array, and the symbols are the characters of the array
		 *
		 * @param {Number} n - An integer
		 * @returns {String} "Hashed" value
		 */
		function hash(n)
		{
			var base = idChars.length;
			var t = '';
			do
			{
				var a = n % base;
				t = idChars.charAt(a) + t;
				n = (n - a) / base;
			} while (n-- > 0)
			return t;
		}

		/** Traverse an object and count the number of instances of each
		 * property name using the supplied dictionary.
		 *
		 * @param {Object} o - something to process
		 * @param {Object} dict - the dictionary where we keep track of occurences
		 */
		function traverseCount(o, dict)
		{
			if (o instanceof Array)
			{
				for (var i = 0; o.length > i; i++) traverseCount(o[i], dict);
			}
			else if (o != null && typeof o == 'object')
			{
				// don't recurse in certain types of objects
				if (!exclude(o))
				{
					for (var k in o)
					{
						// properties with undefined values are not serialized
						// in JSON, so we can leave them out of the consideration
						var v = o[k];
						if (omitUndefined && v === undefined) continue;

						if (dict[k] == null) dict[k] = 0;
						dict[k]++;
						traverseCount(v, dict);
					}
				}
			}
		}

		/** Traverse and rebuild an object, renaming the properties based on
		 * the supplied translation dictionary.
		 *
		 * @param {Object} o - an object or something
		 * @param {Object} dict - translation table for property names
		 * @returns {Object} a copy of the object, with translations applied
		 */
		function traverseRebuild(o, dict)
		{
			if (o instanceof Array)
			{
				var ar = [];
				for (var i=0; o.length>i; i++) ar.push(traverseRebuild(o[i], dict));
				return ar;
			}
			else if (o != null && typeof o == 'object')
			{
				if (exclude(o)) return o;
				else
				{
					var h = {};
					for (var k in o)
					{
						// properties with undefined values are not serialized
						// in JSON anyhow
						var v = o[k];
						if (omitUndefined && v === undefined) continue;
						h[dict[k]] = traverseRebuild(v, dict);
					}
					return h;
				}
			}
			else return o;
		}

		/** Pack/optimize the supplied object.
		 *
		 * @param {Object} obj - An object, or something
		 * @returns {Object} - the packed/optimized object, or whatever
		 */
		this.pack = function(obj, saveChars)
		{
			// count key occurrences
			var stats = {};
			traverseCount(obj, stats);

			// convert to actual size used by count * key-length
			for (var k in stats) stats[k] = stats[k] * k.length;

			// sort keys by descending length
			var keys = Object.keys(stats).sort(function(a,b) { return stats[b] - stats[a] })

			// replace counts by the hashed index
			for (var i = 0; keys.length > i; i++) stats[keys[i]] = hash(i);

			// rebuild object
			var out = [ keys, traverseRebuild(obj, stats) ];
			if (saveChars === true) out.push(idChars);
			return out;
		}

		/** Unpack a previously packed/optimized object
		 *
		 * @param {Object} obj - Object or value to unpack
		 * @returns {Object} The unpacked object
		 */
		this.unpack = function(obj)
		{
			// transfer the array to a hash->originalPropertyName dictionary
			var dict = {};
			for (var i = 0; obj[0].length > i; i++)	dict[hash(i)] = obj[0][i];

			// reverse the process of pack()
			return traverseRebuild(obj[1], dict);
		}
	}

	// let's make this work both in browsers and in Node

	if (typeof module === 'undefined')
		this.JsonOptimize = JsonOptimize;
	else
		module.exports = JsonOptimize;

})();
