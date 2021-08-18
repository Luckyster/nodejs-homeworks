const { Transform } = require('stream');
const { Chunk } = require('./chunk');
const fs = require('fs');
const path = require('path');


exports.Guardian = class Guardian extends Transform {
	constructor() {
		const options = {
			readableObjectMode: true,
			writableObjectMode: true,
		};
		super(options);

	}

	_transform(chunk, encoding, done) {
		const privatKey = fs.readFileSync(path.resolve('certificates', 'server-key.pem'), 'utf8');
		const instanceChunk = new Chunk(chunk);
		instanceChunk.sign(privatKey);
		this.push(instanceChunk);
		done();
	}
}