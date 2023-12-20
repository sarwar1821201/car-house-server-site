const express = require('express');
const app= express();
const cors= require('cors');
require('dotenv').config();
const port= process.env.PORT || 5000;

app.use(cors());
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w8gsdns.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database= client.db('carsHouse');
    const servicesCollection= database.collection('services')

    const bookingDatabase= client.db('carsHouse');
    const bookingCollection= bookingDatabase.collection('bookings')

    app.get('/services', async(req,res)=>{
        const cursor= servicesCollection.find();
        const result= await cursor.toArray();
        res.send(result)
    } )

    app.get('/services/:id', async(req,res) =>{
        const id= req.params.id;
        const query= {_id : new ObjectId (id) }
    
            const options = {
      // Sort matched documents in descending order by rating
      
      // Include only the `title` and `imdb` fields in the returned document
      projection: {  title: 1, price:1, service_id: 1, img:1 },
    };
        const result= await servicesCollection.findOne(query, options );
        res.send(result)
    } )

    //bookings

   app.get('/bookings', async(req,res)=> {
      console.log(req.query.email)
      let query= {};
      if(req.query?.email){
        query= { email : req.query.email};
      }
        const cursor= bookingCollection.find (query);
        const result= await cursor.toArray();
        res.send (result)
   } )

    app.post('/bookings', async(req,res) =>{
         const booking= req.body;
        // console.log(booking);

         const result= await bookingCollection.insertOne(booking);
         res.send(result)
    } )

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req,res)=>{
    res.send('Car House Server Running')
} )

app.listen( port, () =>{
    console.log(`car house server running on port: ${port}`)
} )