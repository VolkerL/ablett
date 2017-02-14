const express = require('express');
const app = express();

app.use('/libs', express.static('libs/'));
app.use('/engine', express.static('engine/'));
app.use('/assets', express.static('assets/'));

app.use('/tests', express.static('tests/'));

app.use('/finddaisy', express.static('findhorse'));

app.listen(3000);
