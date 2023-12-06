const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const ExpensesCategoriesModel = require('../models/ExpensesCategories');
const NotesCategoriesModel = require('../models/NotesCategories'); 
const BalanceModel = require('../models/Balance');

// Get user by ID | GET /users/me 
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password').lean() 

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json({ user })
})

// Get all users | GET /users 
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean()

  if (!users?.length) {
    return res.status(404).json({ message: 'Users not found' });
  }
  res.status(200).json({ users })
})

// Create user | POST /users 
const createUser = asyncHandler(async (req, res) => {
  try {    
    if(!req.body.username || !req.body.email || !req.body.password){
      return res.status(400).json({ message: 'All fields are required!' })
    } 

    const duplicate = await User.findOne({ email: req.body.email }).lean().exec()

    if(duplicate){ // 409 - conflict
      return res.status(409).json({ message: 'User with that username already exists' })
    }

    const hashedPwd = await bcrypt.hash(req.body.password, 10)

    const doc = new User({
      username: req.body.username,
      email: req.body.email, 
      password: hashedPwd,
    })
      
    const user = await doc.save() 
    
    if(user){

      const { password, ...userData } = user._doc
      const accessToken = jwt.sign(
        {id: user._id},  
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '25d' }
      )

      const noteCategories = ['Personal notes', 'Educational', 'Daily ToDo', 'Grocery', 'Work', 'Health | Self-care' ]
      const expensesCategories = [
        {name: 'Home', limit: 0},
        {name: 'Car', limit: 0},
        {name: 'Communications', limit: 0},
        {name: 'Eating out', limit: 0},
        {name: 'Food', limit: 0},
        {name: 'Gift', limit: 0},
        {name: 'Health', limit: 0},
        {name: 'Pets', limit: 0},
        {name: 'Sport', limit: 0},
        {name: 'Taxi', limit: 0},
        {name: 'Travel', limit: 0 },
        {name: 'Education', limit: 0},  
        {name: 'Entertainment', limit: 0},
        {name: 'Hobbies', limit: 0},
        {name: 'Other', limit: 0}
      ]; 

      const defaultNoteCategories = noteCategories.map((catName) => ({ name: catName, noteCount: 0 }))

      const defaultCurrencies = [
        {currency: 'EUR', symbol: '€', amount: 0}, 
        {currency: 'USD', symbol: '$', amount: 0}, 
        {currency: 'UAH', symbol: '₴', amount: 0}
      ]

      await BalanceModel.create({ user: user._id, currencies: defaultCurrencies, majorCurrency: defaultCurrencies[0]});
      await NotesCategoriesModel.create({ user: user._id, categories: defaultNoteCategories })
      await ExpensesCategoriesModel.create({user: user._id, categories: expensesCategories})


      return res.status(201).json({ ...userData, accessToken });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
      
  } catch (error){  
    res.status(500).json({ message: 'Register is failed!' })  
  }
}) 

// Update user | PATCH /users
// asyncHandler
const updateUser =  (async (req, res) => { 
  const { username, email, password, active, avatar }  = req.body  
  const user = await User.findById(req.userId).exec() 

  const duplicate = await User.findOne({ email }).lean().exec()
  
  if(duplicate && duplicate?._id.toString() !== req.userId){ // 409 - conflict
    return  res.status(409).json({ message: 'User with that username already exist!' })
  }

  if(username) user.username = username
  if(email) user.email = email
  if(avatar) user.avatar = avatar
  if (typeof active === 'boolean') user.active = active
  if(password) user.password = await bcrypt.hash(password, 10)

  const updatedUser = await user.save()
  res.status(200).json(updatedUser)
}) 


// Remove user | DELETE /users 
const removeUser = asyncHandler(async (req, res) => {
 
  const user = await User.findById(req.userId).exec() 
  
  if(!user){
    return  res.status(400).json({ message: 'User not found' })
  }

  const result = await user.deleteOne()
  res.status(200).json({ message: `Username ${result.username} with ID ${result._id} removed!` })
}) 

module.exports = { getUser, getAllUsers, createUser, updateUser, removeUser }