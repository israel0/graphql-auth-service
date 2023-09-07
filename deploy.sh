#!/bin/bash

# Clone or pull the latest changes from the graphql-types-service repository
if [ -d "graphql-types-service" ]; then
  cd graphql-types-service
  git pull
  cd ..
else
  git clone https://github.com/israel0/graphql-types-service.git
fi

# Copy the schema and types to the GraphQL service directory
cp graphql-types-service/schema/schema.graphql graphql-auth-service/src/schema/
cp graphql-types-service/types/types.ts graphql-auth-service/src/types/


# Trigger GraphQL service deployment (e.g., restart the server)
# Add your deployment commands here
