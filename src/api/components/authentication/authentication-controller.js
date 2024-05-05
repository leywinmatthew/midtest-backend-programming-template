const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

// Object untuk menyimpan informasi tentang percobaan login yang gagal
const failedLoginAttempts = {};

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Periksa apakah email user telah mencapai batas percobaan login yang gagal
    if (failedLoginAttempts[email] >= 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts'
      );
    }

    // Periksa login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Tambahkan percobaan login yang gagal ke counter
      failedLoginAttempts[email] = (failedLoginAttempts[email] || 0) + 1;

      // Jika mencapai batas, kembalikan error 403 Forbidden
      if (failedLoginAttempts[email] >= 5) {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts'
        );
      }

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    // Jika login berhasil, reset counter percobaan login yang gagal
    delete failedLoginAttempts[email];

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk mengatur timer reset counter setiap 30 menit
setInterval(() => {
  Object.keys(failedLoginAttempts).forEach((email) => {
    failedLoginAttempts[email] = 0;
  });
}, 30 * 60 * 1000);

module.exports = {
  login,
};
