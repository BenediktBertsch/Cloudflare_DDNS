import axios, { AxiosResponse } from 'axios';
import fs, { readdirSync } from 'fs';
import { ICloudflareEntry } from './models/cloudflare-dns.model';
import { IConfig } from './models/config.model';
const config: IConfig = require('./config.json')

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
    //Copy Config if it doesnt exist on volume
    fs.exists('./src/config.json', () => {
        //Set Values
        api_token = config.tokens;
        mail_address = config.mails;
        zone_identifier = config.zones;
        name = config.domains;
        proxied = config.proxies;
        ipv6active = config.ipv6active;

        //Check if configurated
        let counter: number = 0;
        if (api_token == undefined) {
            console.log("Please set an API-Token ex: 'tokens': ['tokeninput']")
            counter++;
        }
        if (mail_address == undefined) {
            console.log("Please set a Mail ex: 'mails': ['test@test.com']")
            counter++;
        }
        if (zone_identifier == undefined) {
            console.log("Please set a Cloudflare Zone ex: 'zones': ['zone']")
            counter++;
        }
        if (name == undefined) {
            console.log("Please set a domain ex: 'domains': ['example.com']")
            counter++;
        }
        if (proxied == undefined) {
            console.log("Please set if the records are proxied by Cloudflare ex: 'proxies': [true] // or false")
            counter++;
        }
        if (ipv6active == undefined) {
            console.log("Please set if only IPv4 records are updated or IPv6 also ex: 'ipv6active': [true] // or false")
            counter++;
        }
        if (counter > 0) {
            process.exit()
        }
    })
    return true
}

async function main() {
    console.log(new Date().toLocaleString('de-DE', { hour12: false }) + " Checking A and AAAA Records")
    let ipv4: string = await HttpGet('https://v4.ident.me/');
    let ipv6: string = await HttpGet('https://v6.ident.me/');
    console.log(ipv6)
    for (let i = 0; i < api_token.length; i++) {
        let cf: AxiosResponse = await HttpGetAndParams('https://api.cloudflare.com/client/v4/zones/' + zone_identifier[i] + '/dns_records', 'api.cloudflare.com', api_token[i], mail_address[i])
        let dnsarray: ICloudflareEntry[] = cf.data.result;
        if (ipv4 != searchRecordIP(dnsarray, 'A')) {
            let ipv4updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier[i] + '/dns_records/', 'api.cloudflare.com', api_token[i], mail_address[i], 'A', name[i], ipv4, 120, proxied[i], dnsarray)
            if(ipv4updatemsg.data.success == undefined){
                console.log(ipv4updatemsg.data)
            }else{
                if (ipv4updatemsg.data.success) {
                    console.log(name[i] + " Record Updated")
                }
            }
            
        }
        if (ipv6active && ipv6 != searchRecordIP(dnsarray, 'AAAA')) {
            let ipv6updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + zone_identifier[i] + '/dns_records/', 'api.cloudflare.com', api_token[i], mail_address[i], 'AAAA', name[i], ipv6, 120, proxied[i], dnsarray)
            if (ipv6updatemsg.data.success == undefined) {
                console.log(ipv6updatemsg.data)
            }else{
                if (ipv6updatemsg.data.success) {
                    console.log(name[i] + " AAAA Record Updated")
                }
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