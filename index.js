const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
//https://pacific-ridge-36287.herokuapp.com/
//use
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("<h1>hello i am cyclist server</h1>");
});

app.listen(PORT, () => {
  console.log(`I am running in port numebr ${PORT}`);
});
//MONGODB CONNECTION

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p6thn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// console.log(uri)
// CONNERCT AND USER MONGODB DATABASE
async function run() {
  try {
    await client.connect();
    //database and collection
    const database = client.db("cyclist");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("reviwes");

    // GET PRODUCT FROM DATA BASE
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({});
      const products = await result.toArray();
      res.json(products);
    });
    //LOAD SINGLE PRODUCT
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });
    //load all order
    app.get("/manageOrder", async (req, res) => {
      const result = await orderCollection.find({});
      const orders = await result.toArray();
      res.json(orders);
    });
    app.get("/myOrder/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email)
      const query = { email: email };
      const result = await orderCollection.find(query);
      const orders = await result.toArray();
      res.json(orders);
    });
    //cheacked user role for if admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      if (email) {
        console.log(email);
        const query = await { email: email };
        const user = await userCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json(isAdmin);
      }
    });
    // load review
    app.get("/review", async (req, res) => {
      // console.log('rei')
      const result = await reviewCollection.find({});
      const review = await result.toArray();
      res.json(review);
    });
    //SEND DATA IN ORDER COLLECTION
    app.post("/addToCart", async (req, res) => {
      const order = req.body;
      const result = orderCollection.insertOne(order);
      res.json(result);
    });
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });
    //create user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    ///review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    //status updateing
    app.put("/status/:type/:id", async (req, res) => {
      const status = req.params.type;
      const id = req.params.id;
      // console.log(id);
      // console.log(status);
      const filter = { _id: ObjectID(id) };
      const options = { upsert: true };
      const updateDoc = { $set: { status: status } };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    //make an admin
    app.put("/makeAdmin/:admin/:email", async (req, res) => {
      console.log("make admin");
      const admin = req.params.admin;
      const email = req.params.email;
      const requesterAccount = await userCollection.findOne({ email: admin });
      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result);
      } else {
        res.status(401).json({ massage: "You cannot make admin" });
      }
    });
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //await client.close()
  }
}
run().catch(console.dir());
