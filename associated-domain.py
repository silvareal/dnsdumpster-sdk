
import whois
import dns.resolver
import requests
from bs4 import BeautifulSoup

def analyze_domain(domain):
    try:
        # Get WHOIS information
        whois_info = whois.whois(domain)
        print("WHOIS Information:")
        print(whois_info)

        # Get DNS records
        resolver = dns.resolver.Resolver()
        answers = resolver.query(domain, "CNAME")
        print("CNAME Records:")
        for answer in answers:
            print(answer.to_text())

        # Fetch website content
        response = requests.get(f"https://{domain}")
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            print("Website Content:")
            print(soup.title.text)
            print(soup.find('meta', attrs={'name': 'description'}).get('content'))

            # Extract links
            links = [a['href'] for a in soup.find_all('a')]
            print("Links:")
            print(links)

            # Analyze links for potential associations
            for link in links:
                if link.startswith('http'):
                    # Check if the link is a different domain
                    if not link.startswith(f"https://{domain}"):
                        print("Potential associated domain:", link)
        else:
            print(f"Error fetching website: {response.status_code}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    domain = input("Enter a domain name: ")
    analyze_domain(domain)