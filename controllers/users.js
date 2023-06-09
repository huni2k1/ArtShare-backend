const bcrypt = require('bcrypt')
const artWork = require('../models/artwork')
const usersRouter = require('express').Router()
const User = require('../models/user')
const mongoose = require('mongoose');

usersRouter.get('/', async (request, response) => {
  try {
    const users = await User.find({});
    response.status(200).json(users);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});
usersRouter.get('/:id', async (request, response) => {
  const userId = request.params.id
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    response.json(user)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

usersRouter.get('/getID/:userName', async (request, response) => {
  console.log("OK")
  const userName = request.params.userName
  User.find({ name: userName }).then(users => {
    response.json(users[0])
  })
})
usersRouter.post('/', async (request, response) => {
  const { email, name, password } = request.body
  const findUser = await User.find({ email: email })
  if (findUser.length > 0) {
    return response.status(403).json({
      error: 'email already exists'
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({
    email,
    name,
    passwordHash,
  })
  const savedUser = await user.save()
  response.status(201).json(savedUser)
})
usersRouter.post('/postLiked', async (request, response) => {
  const { userID } = request.body
  await User.find({ _id: userID }).then(user => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    else {
      artWork.find({
        _id: { $in: user[0].postLiked }
      }).then(posts => {
        response.status(201).json(posts)
      }).catch(error => {
        console.log(error)
      })
    }
  })
})

module.exports = usersRouter