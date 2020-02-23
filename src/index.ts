import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import { ICloudflareEntry } from './models/cloudflare-dns.model';
import { IConfig } from './models/config.model';
const config: IConfig = require('/config/config.json')

//Values
let intervalmin: number = config.interval;
let api_token: string[];
let mail_address: string[];
let zone_identifier: string[];
let name: string[];
let proxied: boolean[];
let ipv6active: boolean[];

//Start Program
if (checkconfig()) {
    main();
    setInterval(() => {
        main();
    }, intervalmin * 1000 * 60)
}

function checkconfig(): boolean {
    //Config copy if doenst exists on config volume
    fs.exists('/config/config.json', (value: boolean) => {
        if (value == false) {
            fs.copyFile('/nodeapp/dist/config.json', '/config/config.json', (err) => {
                if (err) {
                    throw err
                }
                fs.chmod('/config/config.json', 777, (err) => {
                    if (err) {
                        throw err
                    }
                })
                console.log('Created Config File.')
            })
        }

        //Set Values
        api_token = config.token;
        mail_address = config.mails;
        zone_identifier = config.zones;
        name = config.domains;
        proxied = config.proxies;
        ipv6active = config.ipv6active;
    })
    return true
}

async function main() {
    console.log(new Date().toLocaleString('de-DE', { hour12: false }) + " Checking A and AAAA Records")
    let ipv4: string = await HttpGet('https://v4.ident.me/');
    let ipv6: string = await HttpGet('https://v6.ident.me/');
    for (let i = 0; i < api_token.length; i++) {
        let cf: AxiosResponse = await HttpGetAndParams('https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records', 'api.cloudflare.com', api_token[i], mail_address[i])
        let dnsarray: ICloudflareEntry[] = cf.data.result;
        if (ipv4 != searchRecordIP(dnsarray, 'A')) {
            let ipv4updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records/', 'api.cloudflare.com', api_token[i], mail_address[i], 'A', name[i], ipv4, 120, proxied[i], dnsarray)
            if (ipv4updatemsg.data.success) {
                console.log("A Record Updated")
            }
        }
        if (ipv6active && ipv6 != searchRecordIP(dnsarray, 'AAAA')) {
            let ipv6updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier + '/dns_records/', 'api.cloudflare.com', api_token[i], mail_address[i], 'AAAA', name[i], ipv6, 120, proxied[i], dnsarray)
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

async function UpdateIP(url: string, Host: string, auth_key: string, auth_mail: string, type: string, name: string, ipv4: string, ttl: number, proxied: boolean, recordarray: ICloudflareEntry[]): Promise<AxiosResponse> {
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