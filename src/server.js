const express = require('express');

const app = express();
const PORT = 8000;

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Running on: https:\\localhost:"+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
