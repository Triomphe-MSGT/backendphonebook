require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Note = require('./models/note')

const app = express()

// Middleware
app.use(express.json())
app.use(morgan('tiny'))


const url = process.env.MONGODB_URI

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTPprotocol",
    date: "2022-05-30T19:20:14.298Z",
    important: true
  }
]

const errorHandler = (error, request, response, next) => {
console.error(error.message)

if (error.name === 'CastError') {
return response.status(400).send({ error: 'malformatted id' })
}

next(error)

}

// this must be the last middleware loaded, and all routes must be registered before it!


const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
const body = request.body

if (!body.content) {
  return response.status(400).json({ error: 'content missing' })
}

const note = new Note({
content: body.content,
important: body.important || false,
})

note.save().then(savedNote => {
response.json(savedNote)
})

})


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/:id', (request, response) => {
Note.findById(request.params.id)
.then(note => {
if (note) {
response.json(note)
} else {
response.status(404).end()
}

})
.catch(error => {
console.log(error)
response.status(500).end()
})

})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.delete('/api/notes/:id', (request, response, next) => {
Note.findByIdAndDelete(request.params.id)
.then(result => {
response.status(204).end()
})
.catch(error => next(error))
})

app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})