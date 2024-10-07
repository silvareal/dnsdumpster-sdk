import { DNSDumpsterAPI } from "dnsdumpstersdk";
const instance = new DNSDumpsterAPI();
const result = await instance.search("akomahealth.io");

console.log({ result });
