const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const port = process.env.PORT || 5000;

const uri =
  "mongodb+srv://fluffystore:usWUMaeB15qvXmrF@cluster0.ya1bp.mongodb.net/fluffy-book-store?retryWrites=true&w=majority";

const app = express();
app.use(cors());
app.use(express.json());
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const booksDataBase = client.db("fluffy-book-store").collection("books");

  // Add books :
  app.post("/addBook", (req, res) => {
    const newBookData = req.body;
    console.log("Server data got:", newBookData);
    booksDataBase.insertOne(newBookData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/books", (req, res) => {
    booksDataBase.find().toArray((err, books) => {
      res.send(books);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Server Home");
});

app.listen(port);
