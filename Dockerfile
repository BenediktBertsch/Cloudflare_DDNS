FROM node:13-slim
WORKDIR /nodeapp
COPY package.json /nodeapp
ADD dist /nodeapp
COPY src/config.json /nodeapp
VOLUME [/nodeapp]
RUN npm install
RUN npm install pm2 -g
CMD ["pm2-runtime", "index.js"]