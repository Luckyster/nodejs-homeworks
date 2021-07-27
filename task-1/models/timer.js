exports.timerModel = {
  name: { required: true, type: 'string' },
  delay: { required: true, type: 'number', min: 0, max: 5000 },
  interval: { required: true, type: 'boolean' },
  job: { required: true, type: 'function' },
  args: { required: false, type: 'array' },
};
