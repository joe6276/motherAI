FROM node

WORKDIR /app

COPY  package*.json /app

RUN npm install

COPY  . .

EXPOSE 4002

CMD ["npm", "start"]