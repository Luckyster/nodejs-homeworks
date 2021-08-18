const { Writable } = require('stream');
const fs = require('fs');
const path = require('path');
exports.AccountManager = class AccountManager extends Writable {
	constructor(options = {
		objectMode: true,
	}) {
		super(options);
	}

	_write(chunk, encoding, done) {
		try {
			const publicKey = fs.readFileSync(path.resolve('certificates', 'servercert.pem'), 'utf8');
			if (chunk?.verify(publicKey)) {
				chunk.decode(publicKey);
				fs.readFile('logs.json', function (err, data) {
					if (err) throw err;
					const json = data?.toString() ? JSON.parse(data.toString()) : [];
					json.push(chunk);
					fs.writeFile("logs.json", JSON.stringify(json), function (err) {
						if (err) throw err;
						done();
					});
				});
			}
		} catch (e) {
			console.error(e);
		}
	}
}