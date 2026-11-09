const prisma = require('../db/prisma');

async function createUser(userData) {
  return prisma.user.create({
    data: userData,
    select: {
      id: true,
      name: true,
      email: true
    }
  });
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email: email
    }
  });
}

module.exports = {
  createUser,
  findUserByEmail
};