# Cloudflare DDNS Client

<p align="center">
  <img src="https://raw.githubusercontent.com/BenediktBertsch/Cloudflare_DDNS/master/logo.png" width="150">
</p>

## About
An NodeJS application to update your A and AAAA DNS records.

## How to use this Docker Image
You need to set a config path like this: docker run -v /config:/mnt/user/appdata/ddns/
There you need to set some parameters like API_Token,...


Necessary to run the docker are: token, mail, zone, domain, proxied and interval.

## Credits
[Axios](https://github.com/axios/axios), awesome HTTP Client library!
