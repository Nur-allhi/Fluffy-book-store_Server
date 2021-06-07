const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

const admin = require("firebase-admin");

require("dotenv").config();

const dataBaseUser = process.env.DB_USER;
const dataBasePass = process.env.DB_PASS;
const dataBaseName = process.env.DB_NAME;

const uri = `mongodb+srv://${dataBaseUser}:${dataBasePass}@cluster0.ya1bp.mongodb.net/${dataBaseName}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Firebase admin:
var serviceAccount = require("./Configs/fluffy-book-store-firebase-adminsdk-h9zah-8a4cdd2367.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

client.connect((err) => {
  const booksDataBase = client.db(`${dataBaseName}`).collection("books");

  // Get all the books for home
  app.get("/books", (req, res) => {
    booksDataBase.find().toArray((err, books) => {
      res.send(books);
    });
  });

  // Add books :
  app.post("/addBook", (req, res) => {
    const newBookData = req.body;
    console.log("Server data got:", newBookData);
    booksDataBase.insertOne(newBookData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Send order data to server:
  const orderDataBase = client.db("fluffy-book-store").collection("orders");
  app.post("/getOrder", (req, res) => {
    const orderData = req.body;
    console.log(orderData);
    orderDataBase.insertOne(orderData).then((result) => {
      res.send(result.insertOne > 0);
    });
  });

  //
  app.get("/previousOrders", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            orderDataBase
              .find({ email: req.query.email })
              .toArray((err, orders) => {
                res.send(orders);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      res.status(401).send("Unauthorized Access");
    }
  });

  // Delete book from Database:

  app.delete("/deleteBook/:id", (req, res) => {
    const bookData = req.params.id;
    console.log(bookData);
  });
});

app.get("/", (req, res) => {
  res.send("Server Home");
});

app.listen(process.env.PORT || 5000);
