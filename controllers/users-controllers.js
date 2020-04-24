const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Max Schwarz',
    email: 'test@test.com',
    password: 'testers'
  }
];

const getUsers = async (req, res, next) => {
  let users;
  try {
   users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching Users failed, please try again later', 
      500
      );
      return next(error);
    }
    res.json({users: users.map(user => user.toObject( { getters: true }))});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        'Invalid inputs passed, please check your data.', 
        422
        )) ;
  }
  const { name, email, password, places } = req.body;
   
  let existingUser
  try {
  existingUser = await User.findOne( {email : email });
  } catch (err) {
  const error = new HttpError(
    'Signing up failed, please try again later', 
    500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exist already, please tplease login instead.', 
      422
      );
      return next(error);
    }
  

  const createdUser = new User ({
    name, // name: name
    email,
    password,
    image: 'https://randomuser.me/api/portraits/men/43.jpg',
    places
   });
 
   try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({user: createdUser.toObject( { getters: true })});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

    let existingUser
  try {
  existingUser = await User.findOne( {email : email });
  } catch (err) {
  const error = new HttpError(
    'Logging in  failed, please try again later', 
    500
    );
    return next(error);
  }


  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
        'Could not identify user, credentials seem to be wrong.',
         401
         );
         return next(error);
  }

  res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
