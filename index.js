//
//Easy A Record Update Script for Cloudflare written by Benedikt Bertsch
//
//Libraries
const request = require('requestretry');
//Docker variables
//IPv4
api_token = process.env.token;
mail_address = process.env.mail;
zone_identifier = process.env.zone;
domain = process.env.domain;
proxied = process.env.proxied;
intervalmin = parseInt(process.env.interval, 10);
//IPv6
ipv6active = process.env.ipv6activate;
//Retry Parameters
retryattemps = parseInt(process.env.retry, 10);
retrydelays = parseInt(process.env.delay, 10);
//Update DNS Entry
if (proxied == 'true') {
    proxied = true;
} else {
    proxied = false;
}
if (intervalmin < 2) {
    intervalmin = 2;
}
setInterval(() => {
    if (ipv6active == 'true') {
        console.log(new Date().toLocaleString('de-DE', { hour12: false }) + ' Checking IPv4 and IPv6...');
    } else {
        console.log(new Date().toLocaleString('de-DE', { hour12: false }) + ' Checking IPv4...');
    }
    var options = {
        method: 'GET',
        url: 'https://v4.ident.me/'
    }
    request(options, function (error, response, body) {
        if (error) console.log(error);
        ipv4 = body;
        var options = {
            method: 'GET',
            url: 'https://v6.ident.me/',
            maxAttempts: retryattemps,
            retryDelay: retrydelays,
            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
        }
        request(options, function (error, response, body) {
            if (error) console.log(error);
            ipv6 = body;
            options = {
                method: 'GET',
                url: 'https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records',
                headers:
                {
                    Host: 'api.cloudflare.com',
                    'X-Auth-Key': api_token,
                    'X-Auth-Email': mail_address,
                    'Content-Type': 'application/json'
                },
                maxAttempts: retryattemps,
                retryDelay: retrydelays,
                retrySrategy: request.RetryStrategies.HTTPOrNetworkError
            };
            request(options, function (error, response, body) {
                if (error) console.log(error);
                dns = JSON.parse(body);
                dnsarray = dns.result;
                dnsarray.forEach(function (dnsentry) {
                    if (dnsentry.type == 'A' && dnsentry.content != ipv4) {
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
                            json: true,
                            maxAttempts: retryattemps,
                            retryDelay: retrydelays,
                            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
                        };
                        request(options, function (error, response, body) {
                            if (error) console.log(error);
                            if (body.errors[0] == undefined) {
                                console.log('A Record Updated...');
                            } else {
                                console.log(body.errors[0]);
                            }
                        })
                    }
                    else if (ipv6active == 'true' && dnsentry.type == 'AAAA' && dnsentry.content != ipv6) {
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
                            json: true,
                            maxAttempts: retryattemps,
                            retryDelay: retrydelays,
                            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
                        };
                        request(options, function (error, response, body) {
                            if (error) console.log(error);
                            if (body.errors[0] == undefined) {
                                console.log('AAAA Record Updated...');
                            } else {
                                console.log(body.errors[0]);
                            }
                        })
                    }
                })
            });
        })

    });
}, intervalmin * 1000 * 60);
