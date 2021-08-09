const { Readable } = require('stream');
const { userModel } = require('../models/user');

exports.Ui = class Ui extends Readable {
	constructor(data, options = {
		objectMode: true,
	}) {
		super(options);

		this.data = data;

		this.init();
	}

	init() {
		this.on('data', chunk => {

			try {
				for (const [key, val] of Object.entries(userModel)) {
					if (val.required === true && !chunk.hasOwnProperty(key)) {
						throw new Error('No Required Filed');
					}
					if (
						(val.type === 'array' && !Array.isArray(chunk[key])) ||
						(val.type !== 'array' && typeof chunk[key] !== val.type)
					) {
						throw new Error('Wrong Type');
					}
				}
				for (const [key, val] of Object.entries(chunk)) {
					if (!userModel.hasOwnProperty(key)) {
						throw new Error('User has unnecessary field');
					}
				}
			} catch (error) {
				console.error(
					`Received ${error.name} with a message: '${error.message}'
           Stack Trace: ${error.stack}`,
				);
			}

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