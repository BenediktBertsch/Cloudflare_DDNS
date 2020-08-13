FROM node:13-slim
WORKDIR /nodeapp/dist
COPY package.json /nodeapp
COPY tsconfig.json /nodeapp
ADD dist /nodeapp/dist
VOLUME [/config]
COPY src/config.json /nodeapp/dist
RUN npm install
RUN npm install pm2 -g
CMD ["pm2-runtime", "index.js"]