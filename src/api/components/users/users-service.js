const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { deskripsi, timestamp } = require('../../../models/transaksi-schema');

/**
 * Get list of users
 * @returns {Array}
 */

async function getUsers(page, limit, sortBy, searchTerm) {
  // Fetch users
  const users = await usersRepository.getUsers();

  // Search logic
  let filteredUsers = users.filter(user => {
    if (searchTerm) {
      const [field, term] = searchTerm.split(':');
      // Check if the search field exists on the user object
      if (field == 'email') {
        return user.email.includes(term);
      }
      if (field == 'name') {
        return user.name.includes(term);
      }
      // Ignore search if field doesn't exist
      return true;
    }
    return true; // No search term, return all users
  });

  // Sort logic
  if (sortBy) {
    const [field, direction] = sortBy.split(':');
    filteredUsers = filteredUsers.sort((a, b) => {
      if (field == 'email') {
        if (direction == 'asc') {
          return a.email.localeCompare(b.email);
        } else {
          return b.email.localeCompare(a.email);
        }
      }
      if (field == 'name') {
        if (direction == 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      }
      // Ignore sort if field doesn't exist
      return 0;
    });
  }

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Data formatting
  const results = paginatedUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));

  // Pagination info
  const totalUsers = filteredUsers.length; // Update to use filtered users for accurate count
  const totalPages = Math.ceil(totalUsers / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const paginationInfo = {
    page_number: page,
    page_size: limit,
    count: paginatedUsers.length,
    total_pages: totalPages,
    has_previous_page: hasPreviousPage,
    has_next_page: hasNextPage,
    data: results,
  };

  return paginationInfo;
}

/**
 * Get list of tranaski
 * @returns {Array}
 */
async function getTransaksi() {
  const transaksi = await usersRepository.getTransaksi();

  const results = [];
  for (let i = 0; i < transaksi.length; i += 1) {
    const Transaksi = transaksi[i];
    results.push({
      id: Transaksi.id,
      deskripsi: Transaksi.deskripsi,
      fromUser : Transaksi.fromUser,
      timestamp : Transaksi.timestamp,
      jumlah: Transaksi.jumlah,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Create new transaksi
 * @param {string} deskripsi - Name
 * @param {string} fromUser - ID user
 * @param {string} jumlah - jumlah
 * @returns {boolean}
 */
async function createTransaksi(deskripsi, fromUser, jumlah) {
  try {
    const timestamp = Date.now();
    const newTransaksi = await usersRepository.createTransaksi(deskripsi, fromUser, timestamp, jumlah);
    await newTransaksi.save();
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateTransaksi(id, deskripsi, jumlah) {
  const transaksi = await usersRepository.getTransaksiId(id);

  // User not found
  if (!transaksi) {
    return null;
  }

  try {
    await usersRepository.updateTransaksi(id, deskripsi, jumlah);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteTransaksi(id) {
  const transaksi = await usersRepository.getTransaksiId(id);

  // User not found
  if (!transaksi) {
    return null;
  }

  try {
    await usersRepository.deleteTransaksi(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  getTransaksi,
  createUser,
  createTransaksi,
  updateUser,
  updateTransaksi,
  deleteUser,
  deleteTransaksi,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
