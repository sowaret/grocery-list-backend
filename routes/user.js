const express = require('express'),
	userRouter = express.Router(),
	{ JsonError, validateRequest } = require('../functions'),
	salter = require('../utils/salter'),
	{ User } = require('../models');

userRouter
	.put('/newUser', async (req, res) => {
		const paramSchema = {
			all: ['username', 'password'],
			any: ['display_name'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		const { username, password } = req.body;

		try {
			const user = await User.findOne({ username }, err => {
				throw 'CREATE_USER';
			});
			if (user) throw 'USER_ALREADY_EXISTS';

			const p = salter.hash(password, salter.generateSalt());
			const newUser = new User({
				username,
				salt: p.salt,
				password_hash: p.passwordHash,
			});
			await newUser.save(err => {
				throw 'CREATE_USER'
			});

			return res.status(201).json({ id: newUser._id })

		} catch (errorEnum) { return JsonError(res, errorEnum); }
	});

module.exports = userRouter;
