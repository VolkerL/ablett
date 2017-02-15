const express = require('express');
const app = express();

app.use('/ablett/libs', express.static('libs/'));
app.use('/ablett/engine', express.static('engine/'));
app.use('/ablett/assets', express.static('assets/'));

app.use('/ablett/tests', express.static('tests/'));

app.use('/ablett/finddaisy', express.static('findhorse'));

app.listen(3000);
