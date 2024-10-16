require("dotenv").config();
const app = require("./app.js");
const mongoose = require("mongoose");

// dotenv.config({ path: "./config/.env" });
const DB = process.env.DB.replace("<db_password>", process.env.DB_PASS);
mongoose.connect(DB).then(() => {
  console.log("connected to db...");
});
const PORT = process.env.PORT || 3000;
// console.log(process.env);
const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT} on mode ${app.get("env")} ....`);
});

// Unhandled promise rejections from outside
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err.message);
  console.error("Stack trace:", err.stack);
  server.close(() => {
    console.error("Server is closing due to unhandled rejection");
    // code(0) => exit with success
    // code(1) => exit with failure(uncaught exception)
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated !!!");
  });
});
