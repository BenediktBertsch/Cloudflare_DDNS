FROM node:11-slim

ENV token = ""
ENV mail = ""
ENV zone = ""
ENV domain = ""
ENV proxied = false
ENV interval = 5
ENV ipv6activate = false

WORKDIR /nodeapp
COPY package.json /nodeapp
COPY index.js /nodeapp
RUN npm install --prod
CMD ["node", "index.js"]