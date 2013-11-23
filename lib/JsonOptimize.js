function JsonOptimize(idChars)
{
	idChars = idChars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'; // could use more also

	function hash(n)
	{
		var t = '';
		while (true)
		{
			if (n >= idChars.length)
			{
				var a = n % idChars.length;
				t = idChars.charAt(a) + t;
				n = Math.floor(a / idChars.length);
			}
			else
			{
				t = idChars.charAt(n) + t;
				break;
			}
		}
		return t;
	}

	function traverseCount(o, dict)
	{
		if (o instanceof Array)
		{
			for (var i=0; o.length>i; i++) traverseCount(o[i], dict);
		}
		else if (o != null && typeof o == 'object')
		{
			for (var k in o)
			{
				if (dict[k] == null) dict[k] = 0;
				dict[k]++;
				traverseCount(o[k], dict);
			}
		}
	}

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
			var h = {};
			for (var k in o) h[dict[k]] = traverseRebuild(o[k], dict);
			return h;
		}
		else return o;
	}

	this.pack = function(doc)
	{
		// count key occurrences
		var stats = {};
		traverseCount(doc, stats);

		// convert to actual size used by count * key-length
		for (var k in stats) stats[k] = stats[k] * k.length;

		// sort descending
		var keys = Object.keys(stats).sort(function(a,b) { return stats[b] - stats[a] })

		// replace value by hashed index
		for (var i=0; keys.length>i; i++) stats[keys[i]] = hash(i);

		// rebuild object
		return [ keys, traverseRebuild(doc, stats) ];
	}

	this.unpack = function(doc)
	{
		var dict = {};
		for (i=0; doc[0].length>i; i++)	dict[hash(i)] = doc[0][i];
		return traverseRebuild(doc[1], dict);
	}
}

try { module.exports = JsonOptimize; } catch (e) { }