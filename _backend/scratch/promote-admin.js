const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://framingworld:framingworld@127.0.0.1:5433/framingworld' });

client.connect()
  .then(() => client.query("UPDATE users SET role = 'ADMIN' WHERE email = 'admin@framingworld.in'"))
  .then(res => {
    console.log('Updated rows:', res.rowCount);
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
