FROM node:13-slim
WORKDIR /nodeapp
COPY package.json /nodeapp
COPY tsconfig.json /nodeapp
ADD dist /nodeapp/dist
VOLUME [/config]
COPY src/config.json /nodeapp/dist
RUN npm install
CMD ["npm", "start"]