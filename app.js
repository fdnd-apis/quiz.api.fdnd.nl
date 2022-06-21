require('dotenv').config()
const express = require('express')

const indexRoute = require('./routes/index')
const quizRoute = require('./routes/quiz')
const questionRoute = require('./routes/question')
const errorRoute = require('./routes/error')

module.exports = express()
  .use(express.json())
  .use(express.urlencoded({ extended: true }))

  .use('/', indexRoute)
  .use('/v1/quiz', quizRoute)
  .use('v1/question', questionRoute)
  .use(errorRoute)
