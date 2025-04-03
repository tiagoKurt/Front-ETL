FROM node:22.14.0
WORKDIR /app
COPY package.json .
COPY . .
RUN npm install
RUN npm i sharp
RUN npm run build
CMD ["npm","run","start"]