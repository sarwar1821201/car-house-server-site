const express = require('express');
const app= express();
const jwt = require('jsonwebtoken');
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

   const verifyJWT= (req,res,next)=> {
      console.log('hitting verify jwt')
      console.log(req.headers.authorization)
      const authorization= req.headers.authorization;
      if(!authorization){
        return res.status(401). send({error: true , message: 'unauthorized token' })
      }
      const token = authorization.split(' ') [1];
      console.log('token inside verify hoiche', token )

     /// verify jwt
     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (error, decoded )=> {
          if (error){
            return res.status(403).send({error: true, message: 'unauthorized access' })
          }
          req.decoded=decoded;
          next()
     }  )


   }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database= client.db('carsHouse');
    const servicesCollection= database.collection('services')

    const bookingDatabase= client.db('carsHouse');
    const bookingCollection= bookingDatabase.collection('bookings')

    
    // jwt

    app.post('/jwt', (req,res)=>{
         const user= req.body;
         console.log(user)
         const token= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '23h'
         } );
         console.log({token})
         res.send({token})
    }  )
   
   
   
    //services route
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

   app.get('/bookings', verifyJWT,  async(req,res)=> {
     // console.log(req.query.email)
     // console.log(req.headers.authorization)
     const decoded= req.decoded;
     console.log('come back after', decoded )

     if(decoded.email !== req.query.email){
      return res.status(403).send({error: 1, message: 'unauthorized access' })

     }

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

 //// get data for update something
   
 app.patch('/bookings/:id', async(req,res)=>{
      const id= req.params.id;
      const filter= {_id : new ObjectId(id) }
      const updateBooking= req.body;
      console.log(updateBooking)
      const updateDoc= {
        $set: {
          status: updateBooking.status
        }
      };
      const result= await bookingCollection.updateOne(filter, updateDoc);
      res.send(result)
 }  )



    app.delete('/bookings/:id', async(req, res)=>{
         const id= req.params.id;
         const query= {_id : new ObjectId(id)};
         const result= await bookingCollection.deleteOne(query);
         res.send(result);
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