import * as cheerio from "cheerio";

export interface DNSDumpsterResult {
  domain: string;
  dns_records: {
    dns: DNSRecord[];
    mx: DNSRecord[];
    txt: string[];
    host: DNSRecord[];
  };
  xlsxHost: string;
  domainMap: string;
}

export interface DNSRecord {
  domain: string;
  ip: string;
  reverse_dns: string;
  as: string;
  provider: string;
  country: string;
  header: string;
}

export declare class DNSDumpsterAPI {
  verbose: any;
  session: AxiosInstance;
  constructor(verbose?: boolean, session?: AxiosInstance | null);
  displayMessage(message: string): void;
  retrieveResults(table: cheerio.Cheerio<any>): Promise<DNSRecord[]>;
  retrieveTxtRecord(table: cheerio.Cheerio<any>): string[];
  search(domain: string): Promise<DNSDumpsterResult>;
}
