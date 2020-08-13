import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import { ICloudflareEntry } from './models/cloudflare-dns.model';
import { IConfig } from './models/config.model';
const config: IConfig = require('/config/config.json')

//Start Program
if (checkconfig()) {
    main();
    setInterval(() => {
        main();
    }, config.interval * 1000 * 60)
}

function checkconfig(): boolean {
    //Copy Config if it doesnt exist on volume
    fs.exists('/config/config.json', (value: boolean) => {
        if (value == false) {
            fs.copyFile('/nodeapp/dist/config.json', '/config/config.json', (err) => {
                if (err) {
                    throw err
                }
                fs.chmodSync('/config/config.json', '777')
                console.log('Created Config File.')
            })
        }

        //Check if configurated
        let counter: number = 0;
        if (config.tokens == undefined) {
            console.log("Please set an API-Token ex: 'tokens': ['tokeninput']")
            counter++;
        }
        if (config.mails == undefined) {
            console.log("Please set a Mail ex: 'mails': ['test@test.com']")
            counter++;
        }
        if (config.zones == undefined) {
            console.log("Please set a Cloudflare Zone ex: 'zones': ['zone']")
            counter++;
        }
        if (config.domains == undefined) {
            console.log("Please set a domain ex: 'domains': ['example.com']")
            counter++;
        }
        if (config.proxies == undefined) {
            console.log("Please set if the records are proxied by Cloudflare ex: 'proxies': [true] // or false")
            counter++;
        }
        if (config.ipv6active == undefined) {
            console.log("Please set if only IPv4 records are updated or IPv6 also ex: 'ipv6active': [true] // or false")
            counter++;
        }
        if (counter > 0) {
            throw new Error("You need first to set the named parameters before this application can start.")
        }
    })
    return true
}

async function main() {
    console.log(new Date().toLocaleString('de-DE', { hour12: false }) + " Checking A and AAAA Records")
    let ipv4: string = await HttpGet('https://v4.ident.me/');
    let ipv6: string = await HttpGet('https://v6.ident.me/');
    console.log(`Current IPv6: ${ipv6}`)
    for (let i = 0; i < config.tokens.length; i++) {
        let cf: AxiosResponse = await HttpGetAndParams('https://api.cloudflare.com/client/v4/zones/' + config.zones[i] + '/dns_records', 'api.cloudflare.com', config.tokens[i], config.mails[i])
        let dnsarray: ICloudflareEntry[] = cf.data.result;
        if (ipv4 != searchRecordIP(dnsarray, 'A')) {
            let ipv4updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + config.zones[i] + '/dns_records/', 'api.cloudflare.com', config.tokens[i], config.mails[i], 'A', config.domains[i], ipv4, 120, config.proxies[i], dnsarray)
            if(ipv4updatemsg.data.success == undefined){
                console.log(ipv4updatemsg.data)
            }else{
                if (ipv4updatemsg.data.success) {
                    console.log(config.domains[i] + " Record Updated")
                }
            }
            
        }
        if (config.ipv6active && ipv6 != searchRecordIP(dnsarray, 'AAAA')) {
            let ipv6updatemsg: AxiosResponse = await UpdateIP('https://api.cloudflare.com/client/v4/zones/' + config.zones[i] + '/dns_records/', 'api.cloudflare.com', config.tokens[i], config.mails[i], 'AAAA', config.domains[i], ipv6, 120, config.proxies[i], dnsarray)
            if (ipv6updatemsg.data.success == undefined) {
                console.log(ipv6updatemsg.data)
            }else{
                if (ipv6updatemsg.data.success) {
                    console.log(config.domains[i] + " AAAA Record Updated")
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