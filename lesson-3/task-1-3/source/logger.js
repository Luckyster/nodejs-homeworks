const { Transform } = require('stream');
const { Db } = require('./db');

exports.Logger = class Logger extends Transform {
	constructor(options = {
		readableObjectMode: true,
		writableObjectMode: true,
	}) {
		super(options);
		this._db = new Db();
	}

	_transform(chunk, encoding, done) {
		this._db.emit('data', { ...chunk.meta, ...chunk.payload, created: new Date() });
		this.push(chunk);
		done();
	}
}