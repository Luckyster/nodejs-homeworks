exports.personModel = {
  name: { required: true, type: 'string' },
  balance: { required: true, type: 'number', min: 0 },
  limit: {  type: 'function' },
};
