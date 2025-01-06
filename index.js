const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("data", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

// 3.1: Phonebook backend step 1
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

//   3.2: Phonebook backend step 2
app.get("/info", (request, response) => {
  console.log("Info Route Start");
  let personsLength = persons.length;
  const now = new Date().toString();

  response.send(
    `<p>Phonebook has info for ${personsLength} people</p><p>${now}</p>`
  );
});

// 3.3: Phonebook backend step 3
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((persons) => persons.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

// 3.4: Phonebook backend step 4
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

// 3.5: Phonebook backend step 5 + 6
app.post("/api/persons", (request, response) => {
  const body = request.body;
  //    Step 6
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or Number missing",
    });
  }
  const nameExists = persons.some((person) => person.name === body.name);
  //    Step 6
  if (nameExists) {
    return response.status(400).json({
      error: "name already exists",
    });
  }

  const newPerson = {
    id: (Math.random() * 10000).toFixed(0),
    name: body.name,
    number: body.number,
  };

  persons.push(newPerson);

  response.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});
