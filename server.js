/*eslint-disable*/
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// UNCAUGHT EXCEPTION!
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 🧨 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  })
  .then(con => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });
// .catch(err => console.log('ERROR'))

// FOR TEST
/* const testSchema = new Tour({
  name: 'the park camper',
  price: 785
});

testSchema
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => {
    console.log('Error : ', err);
  });
*/
// console.log(process.env);

// TO INSTALL ESLINT
//npm install eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`listing on port ${port} `);
});

// username: jemalabdulkadir712
// password: pLj7gSKizoPrBy9k;
// 196.188.224.206/32

// ERROR OUTSIDE EXPRESS UNHANDLED REJECTION Eg. SERVER CONNECTION ERROR
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 🧨 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); //0 is success 1 is stands for uncaught exception
  });
});
