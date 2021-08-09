const EventEmitter = require('events');

exports.Db = class Db extends EventEmitter {
	constructor() {
		super();
		this.logs = new Map();
		this.init();
	}

	init() {
		this.on('data', function (data) {
			this.logs.set(new Date().toISOString(), data);
			console.log('this.logs', this.logs);
		});
	}
}