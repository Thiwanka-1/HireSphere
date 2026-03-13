# 1. Use a lightweight Node.js image as the base
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the package files first
COPY package*.json ./

# 4. Install the dependencies inside the container
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Document which port this container will use
EXPOSE 5000

# 7. The command to start the server
CMD ["npm", "start"]