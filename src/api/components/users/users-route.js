const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  // Get list of users
  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  // Get list of transaksi
  route.get('/transaksi', authenticationMiddleware, usersControllers.getTransaksi);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser // Perbaiki ini, mengarahkan ke fungsi createUser dari controller
  );

  // Create transaksi
  route.post(
    '/transaksi/:id',
    authenticationMiddleware,
    celebrate(usersValidator.createTransaksi),
    usersControllers.createTransaksi // Perbaiki ini, mengarahkan ke fungsi createUser dari controller
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  // Update transaksi
  route.put(
    '/transaksi/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateTransaksi),
    usersControllers.updateTransaksi
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  // Delete user
  route.delete('/transaksi/:id', authenticationMiddleware, usersControllers.deleteTransaksi);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );
};
