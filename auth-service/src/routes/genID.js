const crypto = require("crypto");

function generateUniqueId(email) {
    return crypto.createHash("sha256").update(email).digest("hex");
  }

const id1 = generateUniqueId("john.doe@example.com");
console.log(id1);
const id2 = generateUniqueId("jane.smith@example.com");
console.log(id2);
const id3 = generateUniqueId("bob.johnson@example.com");
console.log(id3);
