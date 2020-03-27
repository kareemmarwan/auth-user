const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
var cors = require("cors");

const app = express();


// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false}));
app.use(cors());

app.get('/',(req,res)=> res.send('API Running '));

app.use('/api/users',require('./routers/users'));
app.use('/api/auth',require('./routers/auth'));



const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));


