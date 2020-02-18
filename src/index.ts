import axios, { AxiosResponse } from 'axios';
import { ICloudflareEntry } from './models/cloudflare-dns.model';
//Docker Variables
//IPv4
let api_token: string[] = [process.env.token];
let mail_address: string[] = [process.env.mail];
let zone_identifier: string[] = [process.env.zone];
let name: string[] = [process.env.domain];
let proxied: boolean[] = [process.env.proxied];
let intervalmin: number = parseInt(process.env.interval, 10);
//IPv6
let ipv6active: boolean[] = [process.env.ipv6activate];

//Start Program
main();
setInterval(() => {
    main();
}, intervalmin * 1000 * 60)


async function main() {
    console.log(new Date().toLocaleString('de-DE', { hour12: false }) + " Checking A and AAAA Records")
    let ipv4: string = await HttpGet('https://v4.ident.me/');
    let ipv6: string = await HttpGet('https://v6.ident.me/');
    for (let i = 0; i < api_token.length; i++) {
        let cf: AxiosResponse = await HttpGetAndParams('https://api.cloudflare.com/client/v4/zones/' + zone_identifier[i] + '/dns_records', 'api.cloudflare.com', api_token[i], mail_address[i])
        let dnsarray: ICloudflareEntry[] = cf.data.result;
        if (ipv4 != searchRecordIP(dnsarray, 'A')) {
            let ipv4updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier[i] + '/dns_records/', "PUT", 'api.cloudflare.com', api_token[i], mail_address[i], 'A', name[i], '91.23.87.106', 120, proxied[i], dnsarray)
            if (ipv4updatemsg.data.success) {
                console.log("A Record Updated")
            }
        }
        if (ipv6active && ipv6 != searchRecordIP(dnsarray, 'AAAA')) {
            let ipv6updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier[i] + '/dns_records/', "PUT", 'api.cloudflare.com', api_token[i], mail_address[i], 'AAAA', name[i], '2003:e2:bf3c:a985:eda4:ccf5:2fde:dd33', 120, proxied[i], dnsarray)
            if (ipv6updatemsg.data.success) {
                console.log("AAAA Record Updated")
            }
        }
    }
}

async function HttpGet(url: string): Promise<string> {
    return axios.get(url).then((resp) => {
        return resp.data;
    }).catch((err) => {
        return err;
    })
}

async function HttpGetAndParams(url: string, Host: string, auth_key: string, auth_mail: string): Promise<AxiosResponse> {
    const instance = axios.create({
        headers: {
            Host,
            'X-Auth-Key': auth_key,
            'X-Auth-Email': auth_mail,
            'Content-Type': 'application/json'
        }
    })
    return instance(url).then((resp) => {
        return resp;
    }).catch((err) => {
        return err;
    })
}

async function UpdateIP(url: string, method: any, Host: string, auth_key: string, auth_mail: string, type: string, name: string, ipv4: string, ttl: number, proxied: boolean, recordarray: ICloudflareEntry[]): Promise<AxiosResponse> {
    return axios.put(url + searchRecordID(recordarray, type), {
        type,
        name,
        content: ipv4,
        ttl,
        proxied
    }, {
        headers: {
            Host,
            'X-Auth-Key': auth_key,
            'X-Auth-Email': auth_mail,
            'Content-Type': 'application/json'
        }
    }).then((resp) => {
        return resp;
    }).catch((err) => {
        return err;
    })
}

function searchRecordID(recordarray: ICloudflareEntry[], type: string): string {
    let returnvalue = '';
    recordarray.forEach((rec) => {
        if (rec.type === type) {
            returnvalue = rec.id;
        }
    })
    return returnvalue;
}

function searchRecordIP(recordarray: ICloudflareEntry[], type: string): string {
    let returnvalue = '';
    recordarray.forEach((rec) => {
        if (rec.type === type) {
            returnvalue = rec.content;
        }
    })
    return returnvalue;
}