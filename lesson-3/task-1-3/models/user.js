exports.userModel = {
	name: {required: true, type: 'string', encrypted: false},
	email: {required: true, type: 'string', encrypted: true},
	password: {required: true, type: 'string', encrypted: true},
};
