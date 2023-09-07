const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql"); // Updated import statement
const { buildSchema } = require("graphql");
const { mongoose } = require("mongoose");
const User = require("./models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const dotenv = require("dotenv").config();

const app = express();
const dbConnect = process.env.CONNECTURL;
;

if (!dbConnect) {
  console.error('Error: CONNECTURL environment variable is not defined.');
} else {
  mongoose.connect(dbConnect)
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.log("Database Connected!")
        console.log(`SERVER IS RUNNING at port ${process.env.PORT}`);
      });
    })
    .catch(err => {
      console.error('Error connecting to the database:', err);
    });
}

const users = [];


const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

//  Graphql
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
 
      type User {
          _id : ID!,
          name: String!
          email: String!
          password: String,
          token: String
      }

      input UserInput {
         name: String!
         email: String!
         password: String!
      }

      input UserLogin {
         email: String!
         password: String!
      }


      type RootQuery {
        users: [User!]!
      }

      type RootMutation {
        createUser(userInput: UserInput) : User
        loginUser(userLogin: UserLogin) : User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }

    `),

    // Resolver
    rootValue: {
    
      loginUser: async (args) => {
        const { email , password } = args.userLogin;
        
        try {
          const user = await User.findOne({ email }); // Assuming 'name' is unique
          
          if (!user) {
            throw new Error('User not found');
          }
      
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid Password credential');
          }
      
          const secretKey = crypto.randomBytes(32).toString('hex');
          
          const payload = {
            sub: user.password,
            exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
            iss: 'israel-code-assessment-issuer',
            // Add other claims as needed
          };
      
          const token = jwt.sign(payload, secretKey);
      
          // Initialize user.user.token as an array if it's not already
          if (!user.user) {
            user.user = {}; // Initialize user.user object
          }
      
          if (!user.user.token) {
            user.user.token = [];
          }
      
          // Push the token into the array
          user.user.token.push(token);
          
          // Save the user with the updated token array
          await user.save();
          
          // Return the user data with the token
          return { ...user._doc, token };
        } catch (error) {
          throw error;
        }
      },
      

// Modify the createUser resolver
createUser: async (args) => {
  const { name, email, password } = args.userInput;

  try {
    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the provided password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Return the user data with the hashed password removed
    return {
      ...savedUser._doc,
      password: null,
      _id: savedUser.id,
    };
  } catch (error) {
    throw error;
  }
},
    },

    graphiql: true,
  })
);


