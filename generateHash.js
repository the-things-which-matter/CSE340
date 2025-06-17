const bcrypt = require('bcryptjs');

async function createHash() {
  const password = "brima";
  const hash = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hash);
}

createHash();