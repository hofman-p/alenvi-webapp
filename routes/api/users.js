"use strict";

const express         = require('express');
const response        = require('../../helpers/response.js');
const translate       = require('../../helpers/translate.js');
const tokenConfig     = require('../../config/strategies').token;
const router          = express.Router();
const passport        = require('passport');
const tokenProcess    = require('../../helpers/tokenProcess');
const language        = translate.language;
const path            = require('path');
const _               = require('lodash');

const userController  = require('../../controllers/userController');

router.get('/authorize', userController.authorize);
router.post('/authenticate', userController.authenticate);
// router.get('/authenticate/facebook', passport.authenticate('facebook', {session: false}));
// router.get('/authenticate/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login'}), function(req, res) {
//   var payload = {
//     'firstname': req.user.firstname,
//     'lastname': req.user.lastname,
//     '_id': req.user.id,
//     'facebook': req.user.facebook,
//     'role': req.user.role,
//     'customer_id': req.user.customer_id,
//     'employee_id': req.user.employee_id,
//     'sector': req.user.sector
//   }
//   var newPayload = _.pickBy(payload);
//   var token = tokenProcess.encode(newPayload);
//   console.log(req.user);
//   console.log(req.user.facebook.email + ' connected');
//   // return the information including token as JSON
//   return response.success(res, translate[language].userAuthentified, { user: req.user, token: token });
// });
// successRedirect: '/bouh',

router.get('/bot/facebook/account_linking', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/../../public/account_linking.html'));
});


// router.post('/botauth/facebook', userController.bothauthFacebook);

router.post('/', userController.create);

// Routes protection by token
// router.use(verifToken({ secret: tokenConfig.secret }));
router.use(tokenProcess.decode({secret: tokenConfig.secret}));

// All these routes need a token because of route protection above
router.get('/', userController.showAll);
router.get('/:_id', userController.show);
router.put('/:_id', userController.update);
router.delete('/:_id', userController.delete);

module.exports = router;
