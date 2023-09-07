const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphqlHTTP = require("express-graphql");
const { schema, rootValue } = require("./src/graphql/schema");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: rootValue,
    graphiql: true,
  })
);

// Database connection
const dbConnect = process.env.MONGODB_URI || "mongodb://localhost/graphql-auth";
mongoose
  .connect(dbConnect, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server is running...");
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
