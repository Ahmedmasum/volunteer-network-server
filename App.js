const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const multer = require("multer");
const upload = multer();
const ObjectId = require("mongodb").ObjectId;

const app = express();
require("dotenv").config();
app.use(cors());

app.use(bodyParser.json());

//database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rxunt.mongodb.net/volunteer-network?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  if (err) {
    return console.log(err);
  }
  const eventsCollection = client.db("volunteer-network").collection("events");
  const registeredEventCollection = client
    .db("volunteer-network")
    .collection("registeredEvent");

  app.post("/addEvents", (req, res) => {
    eventsCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/events", (req, res) => {
    eventsCollection
      .find({})

      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/events/:id", (req, res) => {
    eventsCollection
      .find({ _id: ObjectId(req.params.id) })

      .toArray((err, documents) => {
        console.log(documents);
        res.send(documents[0]);
      });
  });

  app.post("/registeredEvent", (req, res) => {
    const registeredEvent = req.body;
    console.log(req.body);
    registeredEventCollection.insertOne(registeredEvent).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/registeredEvents", (req, res) => {
    console.log(req.query.email);
    registeredEventCollection
      .find({ email: req.headers.email })
      .toArray((error, documents) => {
        res.status(200).send(documents);
      });
  });

  app.delete("/cancel-event", (req, res) => {
    registeredEventCollection
      .deleteOne({ _id: ObjectId(req.headers.id) })
      .then((result) => {
        console.log(`Deleted ${result.deletedCount} item`);
        res.send(result.deletedCount > 0);
      })
      .catch((err) => console.error(`Delete failed with error ${err}`));
  });
  console.log("database connected successfully");
});

app.get("/", (req, res) => {
  res.send("hello from volunteer network");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`server is running in port ${PORT}`);
});
