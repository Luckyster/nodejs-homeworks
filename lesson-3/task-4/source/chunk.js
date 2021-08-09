const { userModel } = require('../models/user');

class Chunk {
	constructor(chunk) {
		this.set(chunk);
	}

	_hexEncode(data) {
		return Buffer.from(data, 'utf8').toString('hex');
	}
	_decode(data, algorithm = 'hex'){
		return Buffer.from(data, algorithm).toString();
	}
	set(chunk) {
		if(chunk?.meta?.algorithm){
			for (const [key, val] of Object.entries(chunk?.payload)) {
				this[key] = userModel[key].encrypted ? this._decode(val, chunk?.meta?.algorithm) : val;
			}
			return;
		}
		this.meta = {source: 'ui'};
		this.payload = {};
		for (const [key, val] of Object.entries(chunk)) {
			this.payload[key] = userModel[key].encrypted ? this._hexEncode(val) : val;
		}
	}
}

exports.Chunk = Chunk;
