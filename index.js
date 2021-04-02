const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.aymkz.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;


const app = express()


const port = process.env.PORT || 4200;

app.use(express.json());
app.use(cors());



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log("connection error: ", err);
  const bookCollection = client.db("bookiradb").collection("books");
  const ordersCollection = client.db("bookiradb").collection("orders");
  // console.log(ordersCollection);
  console.log(`database connected at http://localhost:${port}`);

  app.get('/events', (req, res) => {
    bookCollection.find()
      .toArray((err, items) => {
        // console.log('from database', items)
        res.send(items)
      })
  })

  app.post('/addBook', (req, res) => {
    const newBook = req.body;
    console.log('adding new book:', newBook);
    bookCollection.insertOne(newBook)
      .then(result => [
        console.log('inserted count: ', result.insertedCount),
        res.send(result.insertedCount > 0)
      ])
  })

  app.get('/events/:id', (req, res) => {
    const id = ObjectId(req.params.id)
    console.log(id);
    bookCollection.find({ _id: id })
      .toArray((err, books) => {
        console.log(err)
        console.log(books[0]);
        res.send(books[0])
      })
  })

  app.post('/buyBook', (req, res) => {
    const newBook = req.body;
    ordersCollection.insertOne(newBook)
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })
  app.get('/allOrders', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, orders) => {
        res.send(orders);
      })
  })

  app.delete('/deleteProduct/:id', (req, res) => {
    const id = ObjectId(req.params.id)
    bookCollection.deleteOne({ _id: id })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

});


app.listen(port);