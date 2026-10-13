import requests

base = "http://127.0.0.1:8000"

# Test 1: India companies Top 5
r1 = requests.get(f"{base}/api/geographic/companies?country=India&top_n=5&year=2025").json()
print("India Companies Top 5:")
for c in r1.get("companies", []):
    print(f"  Rank #{c['rank']} ({'TIED' if c['is_tied'] else 'SOLO'}): {c['name']} ({c['ticker']}) - Score: {c['score']}")

# Test 2: Tamil Nadu companies
r2 = requests.get(f"{base}/api/geographic/companies?country=India&state=Tamil%20Nadu&top_n=5").json()
print("\nTamil Nadu Companies:")
for c in r2.get("companies", []):
    print(f"  Rank #{c['rank']}: {c['name']} ({c['ticker']}) - Score: {c['score']}")

# Test 3: India technologies
r3 = requests.get(f"{base}/api/geographic/technologies?country=India&top_n=3&year=2030").json()
print("\nIndia Technologies (2030):")
for t in r3.get("technologies", []):
    print(f"  Rank #{t['rank']}: {t['name']} - Score: {t['score']}")

# Test 4: Overview
r4 = requests.get(f"{base}/api/geographic/overview?top_n=3&year=2030").json()
print(f"\nOverview ({r4.get('total_countries')} countries):")
for card in r4.get("countries", [])[:3]:
    top_c = card['top_companies'][0]['name'] if card['top_companies'] else 'N/A'
    top_t = card['top_technologies'][0]['name'] if card['top_technologies'] else 'N/A'
    print(f"  Country: {card['country']} | Top Comp: {top_c} | Top Tech: {top_t}")
