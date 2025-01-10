const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'test',
    waitForConnections: true,
    connectionLimit: 5, // Adjust based on traffic needs
    queueLimit: 0
});

// Export the pool for reuse
module.exports = pool.promise();
