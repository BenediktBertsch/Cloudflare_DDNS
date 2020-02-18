# Cloudflare DDNS Client

<p align="center">
  <img src="https://raw.githubusercontent.com/BenediktBertsch/Cloudflare_DDNS/master/logo.png" width="150">
</p>

## About
An NodeJS application to update your A and AAAA DNS records.

## How to use this Docker Image
There are several docker extra parameters to setup this container: 
* token = sets your API Token
* mail = sets your E-Mail address
* zone = sets your DNS zone 
* domain = sets your domainname for example: google.com
* proxied = sets your Proxy setting, input: true or false.
* interval = every x minutes to check your DNS settings, minimum 2.
* ipv6activate = You want to update your AAAA aswell? Set this to true.

Necessary to run the docker are: token, mail, zone, domain, proxied, interval, retry and delay.

## Credits
[Request](https://github.com/request/request), awesome HTTP Client library!
