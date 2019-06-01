const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Login
router.post('/login', (req, res, next) => {
  if (req.body.email === undefined || req.body.password === undefined) {
      res.json({
          message: 'email or password was not sent!',
          status: 'error'
      });
  } else {
      User.findOne({ email: req.body.email }).then(user => {
          if (user && user.password === req.body.password) {
              req.session.user = user;

              res.json({
                  user: {
                    user_id: user.id,
                    email: user.email,
                    register_date: user.register_date,
                  },
                  status: 'ok'
              });
          } else {
              res.json({
                  message: 'email or password is wrong!',
                  status: 'error'
              });
          }
      });
  }
});

router.post('/logout', (req, res, next) => {
    req.session.destroy();
    res.json({
        status: 'ok'
    });
});

router.post('/logged_user', (req, res, next) => {
    if (req.session.user !== undefined) {
        let user = req.session.user;

        res.json({
            user: {
                user_id: user.id,
                email: user.email,
                register_date: user.register_date,
            },
            status: 'ok'
        });
    } else {
        res.json({
            message: 'User is not logged in!',
            status: 'error'
        });
    }
});

router.post('/send_email', (req, res, next) => {
    if (req.session.user === undefined) {

        res.json({
            message: 'User is not logged in',
            status: 'error'
        });

        return false;
    }

    let user = req.session.user;

    // config
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'nicolette.wintheiser92@ethereal.email',
            pass: 'habk6QukGUwQrncr2N'
        }
    });

    let cenaBiletu = 20;
    let suma = cenaBiletu * req.body.ilosc_biletow;

    let html = `Podsumowanie zamówienia <br><br>
        Sala: ${req.body.sala} <br>
        Data: ${req.body.data} <br>
        Film: ${req.body.film} <br>
        Ilość biletów: ${req.body.ilosc_biletow} <br>
        Miejsca: ${req.body.miejsca} <br>
        
        Cena: ${req.body.ilosc_biletow} x ${cenaBiletu}zł = ${suma}zł
        <br>
        Zapraszamy!
    `;

    let message = {
        to: user.email,
        subject: 'Kino  Luna Cinema - podsumowanie',
        html: html,
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.log('Error occurred');
            console.log(error.message);
        }

        var previewUrl = nodemailer.getTestMessageUrl(info);

        console.log('Message sent successfully!');
        console.log('Preview URL: ' + previewUrl);

        transporter.close();

        res.json({
            message: 'Email sent',
            status: 'ok',
            preview_url: previewUrl
        });
    });
});

module.exports = router;
