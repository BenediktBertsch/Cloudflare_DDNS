FROM node:13-slim
WORKDIR /nodeapp/dist
COPY package.json /nodeapp
ADD dist /nodeapp
VOLUME [/nodeapp]
RUN npm install
RUN npm install pm2 -g
CMD ["pm2-runtime", "index.js"]