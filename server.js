require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')
const PORT = process.env.PORT || 3500

connectDB()

app.use(logger) 
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.json({limit: '50mb'}));

app.use('/', express.static(path.join(__dirname, '/public')))
// same as
// app.use(express.static('public'));

app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/users'))
app.use('/events', require('./routes/events'))
app.use('/notes-categories', require('./routes/notesCategories')) 
app.use('/notes', require('./routes/notes'))
app.use('/balance', require('./routes/balance'))
app.use('/salary', require('./routes/salary')); 
app.use('/exchanges', require('./routes/exchanges')); 
app.use('/expenses_categories', require('./routes/expensesCategories')); 
app.use('/expenses', require('./routes/expenses')); 

app.all('*', (req, res) => {
  res.status(404)
  if(req.accepts('html')){
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  }else if(req.accepts('json')){
    res.json({message: '404 Not Found!'})
  }else{
    res.type('txt').send('404 Not Found!')
  }
})

app.use(errorHandler);
 
mongoose.connection.once('open', () => {
  console.log('Connected to DB!')
  app.listen(PORT, () => console.log('Backend is running!'))
});
 
mongoose.connection.once('error', (err) => {
  console.log(err)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})