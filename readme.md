# Javascript SDK for dnsdumpster

## Usage
`yarn add dnsdumpster` or `npm i dnsdumpster`
```js
const dns = require('dnsdumpster');
const dnsPrivate = new dns();

```

### And the result

```json
{
    "success": true,
    "data": [
        {
            "detail": "DNS Servers",
            "data": [
                {
                    "domain": "ns1.google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                },
                {
                    "domain": "ns4.google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                },
                {
                    "domain": "ns3.google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                },
                {
                    "domain": "ns2.google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                }
            ]
        },
        {
            "detail": "MX Records",
            "data": [
                {
                    "priority": "10",
                    "domain": "smtp.google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                }
            ]
        },
        {
            "detail": "TXT Records",
            "data": [
                "apple-domain-example",
                "google-site-verification=example",
            ]
        },
        {
            "detail": "Host Records",
            "data": [
                {
                    "domain": "google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                },
                {
                    "domain": "example.google.com",
                    "ip": "ipv4",
                    "provider": "GOOGLE"
                }
            ]
        }
    ]
}
```

# Inspiration
Inspired by [text](https://github.com/PaulSec/API-dnsdumpster.com)
