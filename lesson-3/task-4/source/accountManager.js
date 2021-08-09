const { Writable } = require('stream');

exports.AccountManager = class AccountManager extends Writable {
	constructor(options = {
		objectMode: true,
	}) {
		super(options);
	}

	_write(chunk, encoding, done) {
		console.log(chunk)
		done();
	}
}