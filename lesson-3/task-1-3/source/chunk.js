const { userModel } = require('../models/user');

class Chunk {
	constructor(chunk) {
		this.set(chunk);
	}

	_hexEncode(data) {
		return Buffer.from(data, 'utf8').toString('hex');
	}

	set(chunk) {
		this.meta = {source: 'ui'};
		this.payload = {};
		for (const [key, val] of Object.entries(chunk)) {
			this.payload[key] = userModel[key].encrypted ? this._hexEncode(val) : val;
		}
	}
}

exports.Chunk = Chunk;
