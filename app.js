const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(session({
    secret: 'keyboard cat secret',
    saveUninitialized: true, // always create session
    resave: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false},
}));


app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(cors());

// Express body parser
app.use(express.urlencoded({ extended: true }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Routes
app.use('/api', require('./routes/api.js'));
app.use('/', require('./routes/main.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
