const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "wafapostgres",
  host: "localhost",
  port: 5432,
  database: "sco",
});

module.exports = {
  pool,
};
