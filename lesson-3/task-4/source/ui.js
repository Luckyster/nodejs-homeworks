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
	_logError(error){
		console.error(
			`Received ${error.name} with a message: '${error.message}'
           Stack Trace: ${error.stack}`,
		);
	}
	_validateMeta(valObject){
		try{
			if(typeof valObject !== 'object'){
				throw new Error('Meta isn`t object');
			}
			if(!valObject?.hasOwnProperty('algorithm')){
				throw new Error('No Required Field');
			}
			if(!(valObject.algorithm === "hex" || valObject.algorithm === "base24")){
				throw new Error(`Algorithm has invalid value ${valObject.algorithm}`);
			}

		} catch (error){
			this._logError(error);
		}
	}
	_validatePayload(model, valObject){
		try {
			for (const [key, val] of Object.entries(model)) {
				if (val.required === true && !valObject?.hasOwnProperty(key)) {
					throw new Error('No Required Filed');
				}
				if (
					(val.type === 'array' && !Array.isArray(valObject[key])) ||
					(val.type !== 'array' && typeof valObject[key] !== val.type)
				) {
					throw new Error('Wrong Type');
				}
			}
			for (const [key, val] of Object.entries(valObject)) {
				if (!model.hasOwnProperty(key)) {
					throw new Error('User has unnecessary field');
				}
			}
		} catch (error) {
			this._logError(error);
		}
	}
	init() {
		this.on('data', chunk => {
			this._validatePayload(userModel, chunk?.payload);
			this._validateMeta(chunk?.meta);

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