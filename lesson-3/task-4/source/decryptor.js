const { Transform } = require('stream');
const { Chunk } = require('./chunk');

exports.Decryptor = class Decryptor extends Transform {
	constructor() {
		const options = {
			readableObjectMode: true,
			writableObjectMode: true,
		};
		super(options);

	}

	_transform(chunk, encoding, done) {
		this.push(new Chunk(chunk));
		done();
	}
}