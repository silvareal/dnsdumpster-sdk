import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import qs from "qs";

export class DNSDumpsterAPI {
  verbose: any;
  session: AxiosInstance;
  constructor(verbose = false, session = null) {
    this.verbose = verbose;
    this.session = session || axios.create();
  }

  displayMessage(message: string) {
    if (this.verbose) {
      console.log(`[verbose] ${message}`);
    }
  }

  async retrieveResults(table: cheerio.Cheerio<any>) {
    const res: {
      domain: string;
      ip: string;
      reverse_dns: string;
      as: string;
      provider: string;
      country: string;
      header: string;
    }[] = [];
    table.find("tr").each((_i: any, tr) => {
      const tds = cheerio.load(tr)("td");
      const patternIp = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
      try {
        const domain = tds.eq(0).html()?.split("<br>")[0] || "";
        const ipMatch = tds.eq(1).text()?.match(patternIp);
        const ip = ipMatch ? ipMatch[0] : "";
        const header = tds
          .eq(0)
          .text()
          .replace("\n", "")
          .split(" ")
          .slice(1)
          .join(" ");
        const reverseDns = tds.eq(1).find("span").text();

        const additionalInfo = tds.eq(2).text();
        const country = tds.eq(2).find("span").text();
        const autonomousSystem = additionalInfo.split(" ")[0];
        let provider = additionalInfo.split(" ").slice(1).join(" ");
        provider = provider.replace(country, "");

        res.push({
          domain,
          ip,
          reverse_dns: reverseDns,
          as: autonomousSystem,
          provider,
          country,
          header,
        });
      } catch (e) {
        // Continue on error
      }
    });
    return res;
  }

  retrieveTxtRecord(table: cheerio.Cheerio<any>) {
    const res: string[] = [];
    table.find("td").each((_i, td) => {
      res.push(cheerio.load(td).text());
    });
    return res;
  }

  async search(domain: string) {
    const dnsDumpsterUrl = "https://dnsdumpster.com/";
    const req = await this.session.get(dnsDumpsterUrl);
    const $ = cheerio.load(req.data);
    const csrfMiddleware = $('input[name="csrfmiddlewaretoken"]').val();
    this.displayMessage(`Retrieved token: ${csrfMiddleware}`);

    const headers = {
      Referer: dnsDumpsterUrl,
      "content-type": "application/x-www-form-urlencoded",
      cookie: `csrftoken=${csrfMiddleware}`,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    };

    const data = {
      csrfmiddlewaretoken: csrfMiddleware,
      targetip: domain,
      user: "free",
    };

    const postReq = await this.session.post(
      dnsDumpsterUrl,
      qs.stringify(data),
      {
        withCredentials: true,
        headers,
      }
    );

    if (postReq.status !== 200) {
      console.error(
        `Unexpected status code from ${dnsDumpsterUrl}: ${postReq.status}`
      );
      return [];
    }

    if (postReq.data.includes("There was an error getting results")) {
      console.error("There was an error getting results");
      return [];
    }

    const loadCheerio = cheerio.load(postReq.data);
    const tables = loadCheerio("table");
    const res = {
      domain,
      dns_records: {
        dns: await this.retrieveResults(tables.eq(0)),
        mx: await this.retrieveResults(tables.eq(1)),
        txt: await this.retrieveTxtRecord(tables.eq(2)),
        host: await this.retrieveResults(tables.eq(3)),
      },
      xlsxHost: "",
      domainMap: "",
    };

    // XLS hosts
    try {
      const pattern = new RegExp(`/static/xls/${domain}-[0-9]{12}\\.xlsx`);
      const xlsUrl = postReq.data.match(pattern)[0];
      const xlsFullUrl = `https://dnsdumpster.com${xlsUrl}`;
      const xlsRes = await this.session.get(xlsFullUrl, {
        responseType: "arraybuffer",
      });
      const xlsData = Buffer.from(xlsRes.data).toString("base64");
      res.xlsxHost = xlsData;
    } catch (err) {
      console.error(err);
      res.xlsxHost = "";
    }

    // Domain map image
    try {
      const pattern = new RegExp(`/static/map/${domain}.png`);
      const mapPngUrl = postReq.data?.match(pattern)?.[0];
      const fullMapPngUrl = `https://dnsdumpster.com${mapPngUrl}`;
      const mapRes = await this.session.get(fullMapPngUrl, {
        responseType: "arraybuffer",
      });
      const mapData = Buffer.from(mapRes.data).toString("base64");
      res.domainMap = mapData;
    } catch (err) {
      console.error(err);
      res.domainMap = "";
    }

    return res;
  }
}
