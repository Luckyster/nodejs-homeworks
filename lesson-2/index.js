const EventEmitter = require('events');
const {personModel} = require('./models/person');

class Bank extends EventEmitter {
	constructor() {
		super();
		this.persons = new Map();
		this.ids = 0;
		this.add();
		this.withdraw();
		this.get();
		this.changeLimit();
		this.error();
	}

	add() {
		this.on('add', (id, admission) => {
			try {
				if (admission <= 0) {
					throw new Error('Admision less or equal to 0');
				}
				const person = this.persons.get(id);
				const balance = person?.balance;
				if (balance <= 0) {
					throw new Error("No Person by that ID");
				}
				const updatedBalance = balance + admission;
				this.persons.set(id, {...person, balance: updatedBalance});
			} catch (e) {
				return this.emit('error', e);
			}
		});
	}

	withdraw() {
		this.on('withdraw', (id, withdrawal) => {
			try {
				if (withdrawal <= 0) {
					throw new Error('Withdrawal less or equal to 0');
				}
				const person = this.persons.get(id);
				if (!person) {
					throw new Error('There is no person by that ID');
				}
				const balance = person?.balance;

				if (balance <= 0) {
					throw new Error('No Balance');
				}
				const updatedBalance = balance - withdrawal;
				if (person?.hasOwnProperty('limit') && !person?.limit(withdrawal, balance, updatedBalance)) {
					throw new Error('Exceeding the limit');
				}
				if (updatedBalance < 0) {
					throw new Error('Not Enough Money');
				}
				this.persons.set(id, {...person, balance: updatedBalance});
			} catch (e) {
				return this.emit('error', e);
			}

		});
	}

	get() {
		this.on('get', (id, callback) => {
			try {
				const person = this.persons.get(id);
				const balance = person?.balance;
				if (!person) {
					throw new Error('There is no person by that ID');
				}
				if (!balance) {
					throw new Error('No Balance');
				}
				return callback(balance)
			} catch (e) {
				return this.emit('error', e);
			}
		});
	}

	send() {
		this.on('send', (personFirstId, personSecondId, admission) => {
			try {
				if (admission <= 0) {
					throw new Error('Admission less or equal to 0');
				}
				if (!this.persons.get(personFirstId) || !this.persons.get(personSecondId)) {
					throw new Error('There is no person by that ID');
				}
				this.emit('withdraw', personFirstId, admission);
				this.emit('add', personSecondId, admission);
			} catch (e) {
				return this.emit('error', e);
			}
		});
	}

	changeLimit() {
		this.on('changeLimit', (id, callback) => {
			if (!this.persons.get(id)) {
				return this.emit('error', new Error('There is no person by that ID'));
			}
			this.persons.get(id).limit = callback;
		});

	}
	error(){
		this.on('error', error => {
			console.error(
					`Received ${error.name} with a message: '${error.message}'
           Stack Trace: ${error.stack}`,
			);
		});
	}
	_validation(valObject, model) {
		try {
			for (const [key, val] of Object.entries(model)) {
				const property = valObject[key];
				if (val.required === true && !property) {
					throw new Error('No Required Filed');
				}
				if (
						(val.type === 'array' && !Array.isArray(property)) ||
						(val.type !== 'array' && valObject[key] && typeof property !== val.type)
				) {
					throw new Error('Wrong Type');
				}
				if (val['unique'] && this._findByProperty(valObject[key], key)) {

					throw new Error('Name already exist');
				}
				if (val['min'] && property <= val.min) {
					throw new Error(`${key} less then or equal to ${val.min}`);
				}
				if (val['max'] && property > val.max) {
					throw new Error(`${key} more then ${val.max}`);
				}
			}
		} catch (e) {
			return this.emit('error', e);
		}
	}

	register(person) {
		this._validation(person, personModel);
		const id = this.ids;
		this.persons.set(id, person);
		this.ids++;
		return id;
	}

	_findByProperty(value, property) {
		for (const [id, val] of this.persons.entries()) {
			if (val[property] === value) {
				return {id, person: val};
			}
		}
		return false;
	}
}

const bank = new Bank();
// //task1
// const personID = bank.register({
// 	name: 'Pitter Black',
// 	balance: 100,
// });
//
// console.log(personID)
// bank.emit('add', personID, 20);
// bank.emit('get', personID, (balance) => {
// 	console.log(`I have ${balance}₴`); // I have 120₴
// });
// bank.emit('withdraw', personID, 50);
// bank.emit('get', personID, (balance) => {
// 	console.log(`I have ${balance}₴`); // I have 70₴
// });
//
// //task2
// const personFirstId = bank.register({
// 	name: 'Pitter White',
// 	balance: 100
// });
// const personSecondId = bank.register({
// 	name: 'Oliver White',
// 	balance: 700
// });
// bank.emit('send', personFirstId, personSecondId, 50);
// bank.emit('get', personSecondId, (balance) => {
// 	console.log(`I have ${balance}₴`); // I have 750₴
// });

const personID = bank.register({
	name: 'Oliver White',
	balance: 911,
	limit: amount => amount < 10
});
const personID2 = bank.register({
	name: 'Pitter Black',
	balance: 100,
});
bank.emit('get', personID, (amount) => {
	console.log(`I have ${amount}₴`); // I have 695₴
});
// Вариант 4
bank.emit('changeLimit', personID, (amount, currentBalance,
																		updatedBalance) => {
	return updatedBalance > 900;
});
bank.emit('send', personID, personID2, 9); // Error
console.log('personID', personID);
console.log('personID2', personID2);
bank.emit('get', personID, (amount) => {
	console.log(`I have ${amount}₴`); // I have 695₴
});