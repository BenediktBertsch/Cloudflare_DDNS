FROM node:11-slim

ENV token = ""
ENV mail = ""
ENV zone = ""
ENV domain = ""
ENV proxied = 
ENV interval = 
ENV ipv6activate = 

WORKDIR /nodeapp
COPY package.json /nodeapp
COPY index.js /nodeapp
RUN npm install --prod
CMD ["node", "index.js"]