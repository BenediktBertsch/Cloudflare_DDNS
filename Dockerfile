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
COPY /dist /nodeapp
RUN npm install
CMD ["npm", "start"]