FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and prisma schema first for caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

EXPOSE 3000

# Run migrations and start the app
CMD npx prisma migrate deploy && npm run start:prod
