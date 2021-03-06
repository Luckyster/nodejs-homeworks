const { Ui } = require('./source/ui')
const { Decryptor } = require('./source/decryptor')
const { AccountManager } = require('./source/accountManager')

const customers = [
  {
    payload: {
      name: 'Pitter Black',
      email: '70626c61636b40656d61696c2e636f6d',
      password: '70626c61636b5f313233'
    },
    meta: {
      algorithm: 'hex'
    }
  },
  {
    payload: {
      name: 'Pitter Black',
      email: '70626c61636b40656d61696c2e636f6d',
      password: '70626c61636b5f313233'
    },
    meta: {
      algorithm: 'hex'
    }
  }
];
const ui = new Ui(customers);
const decryptor = new Decryptor();
const manager = new AccountManager();
ui.pipe(decryptor).pipe(manager);