const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/persons')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('data', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Phonebook</h1>')
})

// Get all
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => next(error))
})

// Info page
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      const now = new Date().toString()
      response.send(
        `<p>Phonebook has info for ${count} people</p><p>${now}</p>`
      )
    })
    .catch((error) => next(error))
})

// Find a Person by ID
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

// Delete Person
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  console.log('Attempting delete: ', id)

  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      console.log('Delete result: ', deletedPerson)
      if (deletedPerson) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => {
      console.error('Delete Error: ', error)
      next(error)
    })
})

// POST new Person
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Name or Number missing',
    })
  }
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
      }
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )

    .then((updatedPersons) => {
      response.json(updatedPersons)
    })
    .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`)
})
