const { Readable } = require('stream');
const { userModel } = require('../models/user');

exports.Descryptor = class Descryptor extends Readable {
	constructor(data, options = {
		objectMode: true,
	}) {
		super(options);

		this.data = data;

		this.init();
	}

	init() {
		this.on('data', chunk => {


		});
	}

	_read() {
		const data = this.data.shift();
		if (!data) {
			this.push(null);
		} else {
			this.push(data);
		}
	}
}