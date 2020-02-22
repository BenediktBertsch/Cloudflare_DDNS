FROM node:12-slim

ENV token = 
ENV mail = 
ENV zone = 
ENV domain = 
ENV proxied = 
ENV interval = 
ENV ipv6activate =

WORKDIR /nodeapp
COPY package.json /nodeapp
COPY tsconfig.json /nodeapp
ADD dist /nodeapp/dist
VOLUME [ "/config" ]
COPY src/config.json /nodeapp/dist
RUN npm install
CMD ["npm", "start"]