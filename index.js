//Libraries
const request = require('request');
//Docker variables
api_token = process.env.token;
mail_address = process.env.mail;
zone_identifier = process.env.zone;
domain = process.env.domain;
proxied = process.env.proxied;  //True od. False
intervalmin = process.env.interval;
//Update DNS Entry
setInterval(() => {
    var options = {
        method: 'GET',
        url: 'https://api.ipify.org'
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
                        })
                    }
                }
            })
        });
    });
}, intervalmin * 1000);
