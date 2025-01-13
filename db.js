const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'your_new_password',
    database: 'pokemon_schema',
    waitForConnections: true,
    connectionLimit: 5, // Adjust based on traffic needs
    queueLimit: 3
});

// Export the pool for reuse
module.exports = pool.promise();