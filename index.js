//
//Easy A Record Update Script for Cloudflare written by Benedikt Bertsch
//
//Libraries
const request = require('request');
//Docker variables
//IPv4
api_token = process.env.token;
mail_address = process.env.mail;
zone_identifier = process.env.zone;
domain = process.env.domain;
proxied = process.env.proxied;
intervalmin = process.env.interval;
//IPv6
ipv6active = process.env.ipv6activate;
//Update DNS Entry
setInterval(() => {
    var options = {
        method: 'GET',
        url: 'https://v4.ident.me/'
    }
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        ipv4 = body;
        options = {
            method: 'GET',
            url: 'https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records',
            headers:
            {
                Host: 'api.cloudflare.com',
                'X-Auth-Key': api_token,
                'X-Auth-Email': mail_address,
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            dns = JSON.parse(body);
            dnsarray = dns.result;
            dnsarray.forEach(function (dnsentry) {
                if (dnsentry.type == 'A') {
                    if (dnsentry.content != ipv4) {
                        options = {
                            method: 'PUT',
                            url: 'https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records/' + dnsentry.id,
                            headers:
                            {
                                Host: 'api.cloudflare.com',
                                'X-Auth-Key': api_token,
                                'X-Auth-Email': mail_address,
                                'Content-Type': 'application/json'
                            },
                            body:
                            {
                                type: 'A',
                                name: domain,
                                content: ipv4,
                                ttl: intervalmin * 60,
                                proxied: proxied
                            },
                            json: true
                        };
                        request(options, function (error, response, body) {
                            if (error) throw new Error(error);
                            console.log(body);
                            console.log('A Record Updated...')
                        })
                    }
                }
                else if(ipv6active == true){
                    if(dnsentry.content == 'AAAA'){
                        var options = {
                            method: 'GET',
                            url: 'https://v6.ident.me/'
                        }
                        request(options, function (error, response, body) {
                            if (error) throw new Error(error);
                            ipv6 = body;
                            options = {
                                method: 'PUT',
                                url: 'https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records/' + dnsentry.id,
                                headers:
                                {
                                    Host: 'api.cloudflare.com',
                                    'X-Auth-Key': api_token,
                                    'X-Auth-Email': mail_address,
                                    'Content-Type': 'application/json'
                                },
                                body:
                                {
                                    type: 'AAAA',
                                    name: domain,
                                    content: ipv6,
                                    ttl: intervalmin * 60,
                                    proxied: proxied
                                },
                                json: true
                            };
                            request(options, function (error, response, body) {
                                if (error) throw new Error(error);
                                console.log(body);
                                console.log('AAAA Record Updated...')
                            })
                        })
                    }
                }
            })
        });
    });
}, intervalmin * 1000 * 60);
