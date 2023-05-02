const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", error => {
  console.log("Uncaught Exception! 💥 Shutting down!" );
  console.log(error.name, error.message);
  process.exit(1);
});


dotenv.config({
  path: "./config.env",
});

const app = require("./app");

// mongoDB connection with nodeJS
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", error => {
  console.log("Unhandled Rejection! 💥 Shutting down!");
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});



