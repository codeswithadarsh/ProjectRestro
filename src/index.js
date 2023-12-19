const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const loginCollection = require('./mongodb');
const contactCollection = require('./contactModel');

const templatePath = path.join(__dirname, '../templates');
const publicPath = path.join(__dirname, '../public');

app.use(express.json());
app.set('view engine', 'hbs');
app.set('views', templatePath);


app.use(express.static(publicPath));

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/');
  }
};

app.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  await loginCollection.insertMany([data]);

  req.session.user = data.name;
  res.render('home', { user: req.session.user });
});

app.post('/login', async (req, res) => {
  try {
    const check = await loginCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      req.session.user = req.body.name;
      res.render('home', { user: req.session.user });
    } else {
      res.send('Incorrect username or password');
    }
  } catch (error) {
    console.error(error);
    res.send('An error occurred');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

app.get('/home', isLoggedIn, (req, res) => {
  res.render('home', { user: req.session.user });
});

// Render contact form
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Handle contact form submission
app.post('/contact', async (req, res) => {
    try {
      const contactData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
      };
  
      // Save contact data
      await contactCollection.insertMany([contactData]);
  
      res.send('Contact form submitted successfully!');
    } catch (error) {
      console.error('Error processing contact form:', error);
      res.status(500).send(`An error occurred: ${error.message}`);
    }
  });
  

// Define a route for /login
app.get('/login', (req, res) => {

  if (req.session.user) {
    res.redirect('/home');
  } else {
    res.render('login');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
