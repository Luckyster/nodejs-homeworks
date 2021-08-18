const { userModel } = require('../models/user');
const crypto = require('crypto');
const { algorithm, password } = require('../config');
class Chunk {
	constructor(chunk) {
		this.set(chunk);
	}

	sign(privatKey) {
		try {
			const sign = crypto.createSign('RSA-SHA256'); // should recreates in each class
			sign.update(this.payload?.email);
			sign.update(this.payload?.password);
			sign.end();
			const signature = sign.sign(privatKey, 'hex');

			this.meta = {
				source: 'ui',
				signature: signature
			};
		} catch (err) {
			console.error(err);
		}
	}

	verify(publicKey) {
		try {
			const verify = crypto.createVerify('RSA-SHA256'); // should recreates in each class
			verify.update(this.payload?.email);
			verify.update(this.payload?.password);
			verify.end();
			return verify.verify(publicKey, this.meta?.signature, 'hex');
		} catch (err) {
			console.error(err);
		}
	}

	_hexEncode(data, decode = false) {
		try {
			const iv = Buffer.alloc(16, 0);
			const key =  crypto.scryptSync(password, 'salt', 24);
			if (decode){
				const decipher = crypto.createDecipheriv(algorithm, key, iv);
				let decrypted = decipher.update(data, 'hex', 'utf8');
				decrypted += decipher.final('utf8');

				return decrypted;
			}
			const cipher = crypto.createCipheriv(algorithm, key, iv);
			let encrypted = cipher.update(data, 'utf8', 'hex');
			encrypted += cipher.final('hex');

			return encrypted;
		} catch (e) {
			console.error(e);
		}
	}
	set(chunk) {
		this.payload = {};
		for (const [key, val] of Object.entries(chunk)) {
			this.payload[key] = userModel[key].encrypted ? this._hexEncode(val) : val;
		}
	}
	decode(publicKey){
		try {
			if(!this.verify(publicKey)){
				throw Error('Wrong Key');
			}
			for (const [key, val] of Object.entries(this.payload)) {
				this.payload[key] = userModel[key].encrypted ? this._hexEncode(val, true) : val;
			}
		} catch (e){
			console.log(e);
		}
	}
}

exports.Chunk = Chunk;
