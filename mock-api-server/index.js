require('dotenv').config();
const express = require('express');
const app = express();
const port = 3333;

app.get('/', (req, res) => {});

app.listen(port, () => {
  console.log(`Mock api server running on localhost:${port}`);
});
