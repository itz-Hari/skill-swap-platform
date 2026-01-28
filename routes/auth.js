const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password],
    () => res.redirect('/')
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE email=? AND password=?',
    [email, password],
    (err, result) => {
      if (result.length > 0) {
        req.session.user = result[0];
        res.redirect('/home');
      } else {
        res.send('Login Failed');
      }
    }
  );
});

module.exports = router;

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});
