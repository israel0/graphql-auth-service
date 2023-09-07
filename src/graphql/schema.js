const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  type AuthPayload {
    user: User
    token: String
  }

  type RootQuery {
    users: [User!]!
  }

  type RootMutation {
    createUser(userInput: UserInput): User
    loginUser(email: String!, password: String!): AuthPayload
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
