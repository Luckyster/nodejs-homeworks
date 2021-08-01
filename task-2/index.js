const EventEmitter = require('events');
const {personModel} = require('./models/person');

class Bank extends EventEmitter {
	constructor() {
		super();
		this.persons = [];

		this.on('add', (id, admission) => {
			if (admission <= 0) {
				return this.emit('error', new Error('Admision less or equal to 0'));
			}
			if (!this.persons[id]) {
				return this.emit('error', new Error('There is no person by that ID'));
			}
			let balance = this.persons[id]?.balance;
			if (balance > 0) {
        const updatedBalance = balance + admission;
				this.persons[id].balance = updatedBalance;
			} else {
				return this.emit('error', new Error("No Balance"));
			}
		});

		this.on('withdraw', (id, withdrawal) => {
			if (withdrawal <= 0) {
				return this.emit('error', new Error('Withdrawal less or equal to 0'));
			}
			if (!this.persons[id]) {
				return this.emit('error', new Error('There is no person by that ID'));
			}
			let balance = this.persons[id]?.balance;

			if (balance > 0) {
				const updatedBalance = balance - withdrawal;
				if(!this.persons[id]?.limit(withdrawal,balance ,updatedBalance)){
          return this.emit('error', new Error('Exceeding the limit'));
        }
				if (balance - withdrawal < 0) {
					return this.emit('error', new Error('Not Enough Money'));
				}
				this.persons[id].balance = updatedBalance;
			} else {
				return this.emit('error', new Error('No Balance'));
			}
		});

		this.on('get', (id, callback) => {
			let balance = this.persons[id]?.balance;
			if (!this.persons[id]) {
				return this.emit('error', new Error('There is no person by that ID'));
			}
			if (balance) {
				return callback(balance)
			} else {
				return this.emit('error', new Error("No Balance"));
			}
		});

		this.on('send', (personFirstId, personSecondId, admission) => {
			if (admission <= 0) {
				return this.emit('error', new Error('Admission less or equal to 0'));
			}
			if (!this.persons[personFirstId] || !this.persons[personSecondId]) {
				return this.emit('error', new Error('There is no person by that ID'));
			}
			this.emit('withdraw', personFirstId, admission);
			this.emit('add', personSecondId, admission);
		});

    this.on('changeLimit', (id, callback) => {
      if (!this.persons[id]) {
        return this.emit('error', new Error('There is no person by that ID'));
      }
      this.persons[id].limit = callback;
    });

		this.on('error', error => {
			console.error(
					`Received ${error.name} with a message: '${error.message}'
           Stack Trace: ${error.stack}`,
			);
		});
	}

	register(person) {
		for (const [key, val] of Object.entries(personModel)) {
			if (val.required === true && !person.hasOwnProperty(key)) {
				return this.emit('error', new Error('No Required Filed'));
			}
			if (
					(val.type === 'array' && !Array.isArray(person[key])) ||
					(val.type !== 'array' && person[key] && typeof person[key] !== val.type)
			) {
				return this.emit('error', new Error('Wrong Type'));
			}
			if (personModel['balance'].hasOwnProperty('min') && person[key] <= val.min) {
				return this.emit('error', new Error(`${key} less then or equal to ${val.min}`));
			}
			if (personModel['balance'].hasOwnProperty('max') && person[key] > val.max) {
				return this.emit('error', new Error(`${key} more then ${val.max}`));
			}
		}
		if (this._findByProperty(person.name)) {
			return this.emit('error', new Error('Name already exist'));
		}
		this.persons.push(person);
    console.log('this.persons.indexOf(person)',this.persons.indexOf(person))
		return this.persons.indexOf(person);
	}

	_findByProperty(name) {
		for (const [index, val] of this.persons.entries()) {
			if (val.name === name) {
				return {index: index, timer: val};
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
bank.emit('send', personID, personID2, 10); // Error
console.log('personID', personID);
console.log('personID2', personID2);
bank.emit('get', personID, (amount) => {
  console.log(`I have ${amount}₴`); // I have 695₴
});