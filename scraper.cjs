/**
 * RTO Dashboard Scraper
 * 
 * Scrapes BuildRemote's Fortune 500 Return To Office Tracker
 * and supplements with curated data from news sources.
 * 
 * Runs via GitHub Actions daily. Zero maintenance.
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');

const BUILDREMOTE_URL = 'https://buildremote.co/companies/return-to-office/';
const OUTPUT_PATH = './public/data/rto_policies.json';
const SOURCE_URL = 'https://buildremote.co/companies/return-to-office/';

// ── Curated baseline dataset (verified from news + trackers) ──────────────────
// This serves as both a fallback and a supplement to scraped data.
const CURATED_DATA = [
  { company: "Amazon", sector: "Consumer Discretionary", policy: "Full Office", daysInOffice: 5, enforcement: "Strict mandate", source: "https://buildremote.co/return-to-office/amazon/" },
  { company: "Alphabet (Google)", sector: "Communication Services", policy: "Hybrid", daysInOffice: 3, enforcement: "3-day expectation", source: "https://buildremote.co/return-to-office/google/" },
  { company: "Apple", sector: "Technology", policy: "Hybrid", daysInOffice: 3, enforcement: "Teams manage schedules", source: "https://buildremote.co/return-to-office/apple/" },
  { company: "Microsoft", sector: "Technology", policy: "Hybrid", daysInOffice: 3, enforcement: "Manager discretion", source: "https://buildremote.co/return-to-office/microsoft/" },
  { company: "Meta", sector: "Communication Services", policy: "Hybrid", daysInOffice: 3, enforcement: "Mandated 3 days", source: "https://buildremote.co/return-to-office/meta-facebook/" },
  { company: "JPMorgan Chase", sector: "Financials", policy: "Full Office", daysInOffice: 5, enforcement: "Badge tracking, strict", source: "https://buildremote.co/return-to-office/jpmorgan-chase/" },
  { company: "Goldman Sachs", sector: "Financials", policy: "Full Office", daysInOffice: 5, enforcement: "Strong in-person expectation", source: "https://buildremote.co/return-to-office/goldman-sachs/" },
  { company: "Wells Fargo", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Manager discretion", source: "https://buildremote.co/return-to-office/wells-fargo/" },
  { company: "Bank of America", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co/return-to-office/bank-of-america/" },
  { company: "Morgan Stanley", sector: "Financials", policy: "Office-First", daysInOffice: 4, enforcement: "Strong expectation", source: "https://buildremote.co/return-to-office/morgan-stanley/" },
  { company: "Citigroup", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Manager discretion", source: "https://entrepreneur.com" },
  { company: "Tesla", sector: "Consumer Discretionary", policy: "Full Office", daysInOffice: 5, enforcement: "Strict, minimum 40hrs", source: "https://buildremote.co" },
  { company: "NVIDIA", sector: "Technology", policy: "Remote-First", daysInOffice: 0, enforcement: "Flexible", source: "https://buildremote.co" },
  { company: "Cisco", sector: "Technology", policy: "Remote-First", daysInOffice: 0, enforcement: "Flexible", source: "https://buildremote.co" },
  { company: "HP", sector: "Technology", policy: "Remote-First", daysInOffice: 0, enforcement: "Flexible", source: "https://buildremote.co" },
  { company: "Intel", sector: "Technology", policy: "Office-First", daysInOffice: 4, enforcement: "Tightening policy", source: "https://buildremote.co/return-to-office/intel/" },
  { company: "Salesforce", sector: "Technology", policy: "Hybrid", daysInOffice: 3, enforcement: "Manager discretion", source: "https://buildremote.co" },
  { company: "AT&T", sector: "Communication Services", policy: "Office-First", daysInOffice: 5, enforcement: "Mandated", source: "https://buildremote.co" },
  { company: "Walt Disney", sector: "Communication Services", policy: "Office-First", daysInOffice: 4, enforcement: "Mandated", source: "https://buildremote.co" },
  { company: "Starbucks", sector: "Consumer Discretionary", policy: "Office-First", daysInOffice: 4, enforcement: "CEO-driven", source: "https://buildremote.co/return-to-office/starbucks/" },
  { company: "Nike", sector: "Consumer Discretionary", policy: "Office-First", daysInOffice: 4, enforcement: "Mandated", source: "https://buildremote.co" },
  { company: "Home Depot", sector: "Consumer Discretionary", policy: "Full Office", daysInOffice: 5, enforcement: "Strict", source: "https://buildremote.co/return-to-office/home-depot/" },
  { company: "Caterpillar", sector: "Industrials", policy: "Full Office", daysInOffice: 5, enforcement: "Performance-linked", source: "https://buildremote.co" },
  { company: "UPS", sector: "Industrials", policy: "Full Office", daysInOffice: 5, enforcement: "Strict", source: "https://buildremote.co" },
  { company: "Paramount Skydance", sector: "Communication Services", policy: "Full Office", daysInOffice: 5, enforcement: "Strict mandate", source: "https://archieapp.co" },
  { company: "Truist Financial", sector: "Financials", policy: "Full Office", daysInOffice: 5, enforcement: "Strict; ending hybrid", source: "https://archieapp.co" },
  { company: "PNC Financial", sector: "Financials", policy: "Full Office", daysInOffice: 5, enforcement: "Strict", source: "https://archieapp.co" },
  { company: "Sherwin-Williams", sector: "Materials", policy: "Full Office", daysInOffice: 5, enforcement: "Strict", source: "https://archieapp.co" },
  { company: "Novo Nordisk", sector: "Healthcare", policy: "Full Office", daysInOffice: 5, enforcement: "Strict", source: "https://archieapp.co" },
  { company: "NBCUniversal", sector: "Communication Services", policy: "Office-First", daysInOffice: 4, enforcement: "Not explicit", source: "https://archieapp.co" },
  { company: "Ford", sector: "Consumer Discretionary", policy: "Hybrid", daysInOffice: 3, enforcement: "Manager discretion", source: "https://buildremote.co/return-to-office/ford/" },
  { company: "Verizon", sector: "Communication Services", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co/return-to-office/verizon/" },
  { company: "John Deere", sector: "Industrials", policy: "Office-First", daysInOffice: 4, enforcement: "Standard", source: "https://buildremote.co/return-to-office/john-deere/" },
  // Additional Fortune 500 with known policies
  { company: "Walmart", sector: "Consumer Staples", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "UnitedHealth Group", sector: "Healthcare", policy: "Hybrid", daysInOffice: 4, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Exxon Mobil", sector: "Energy", policy: "Hybrid", daysInOffice: 5, enforcement: "Not explicit", source: "https://buildremote.co" },
  { company: "CVS Health", sector: "Healthcare", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co/return-to-office/cvs/" },
  { company: "Cencora", sector: "Healthcare", policy: "Remote-First", daysInOffice: 0, enforcement: "Flexible", source: "https://buildremote.co" },
  { company: "Berkshire Hathaway", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Eli Lilly", sector: "Healthcare", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Johnson & Johnson", sector: "Healthcare", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Procter & Gamble", sector: "Consumer Staples", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Chevron", sector: "Energy", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Coca-Cola", sector: "Consumer Staples", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "PepsiCo", sector: "Consumer Staples", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Oracle", sector: "Technology", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Costco", sector: "Consumer Staples", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Visa", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "Mastercard", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co" },
  { company: "State Farm", sector: "Financials", policy: "Hybrid", daysInOffice: 3, enforcement: "Standard", source: "https://buildremote.co/return-to-office/state-farm/" },
];

// ── Helper: fetch a URL and return HTML ───────────────────────────────────────
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RTODashboardBot/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ── Parse the BuildRemote page for the top-10 table ───────────────────────────
function parseTable(html) {
  const $ = cheerio.load(html);
  const scraped = [];

  // Find all tables on the page and parse rows
  $('table').each((_, table) => {
    $(table).find('tr').each((i, row) => {
      if (i === 0) return; // skip header
      const cells = $(row).find('td');
      if (cells.length < 5) return;

      const company = $(cells[0]).text().trim();
      const policyRaw = $(cells[3]).text().trim();
      const daysRaw = $(cells[4]).text().trim();

      if (!company || !policyRaw) return;

      // Normalize policy
      let policy = 'Hybrid';
      const pl = policyRaw.toLowerCase();
      if (pl.includes('office first') || pl.includes('office-first')) policy = 'Office-First';
      else if (pl.includes('remote first') || pl.includes('remote-first')) policy = 'Remote-First';
      else if (pl.includes('hybrid')) policy = 'Hybrid';
      else if (pl.includes('full')) policy = 'Full Office';

      // Normalize days
      let daysInOffice = 3;
      const daysMatch = daysRaw.match(/(\d)/);
      if (daysMatch) daysInOffice = parseInt(daysMatch[1]);
      if (policy === 'Remote-First') daysInOffice = 0;

      scraped.push({ company, policy, daysInOffice });
    });
  });

  return scraped;
}

// ── Merge scraped data into curated baseline ──────────────────────────────────
function mergeData(scraped, curated) {
  const merged = new Map();

  // Start with curated data
  for (const entry of curated) {
    merged.set(entry.company.toLowerCase(), { ...entry });
  }

  // Override with scraped data where available
  for (const entry of scraped) {
    const key = entry.company.toLowerCase();
    if (merged.has(key)) {
      const existing = merged.get(key);
      existing.policy = entry.policy;
      existing.daysInOffice = entry.daysInOffice;
      existing.source = SOURCE_URL;
    } else {
      merged.set(key, {
        company: entry.company,
        sector: "Various",
        policy: entry.policy,
        daysInOffice: entry.daysInOffice,
        enforcement: "Standard",
        source: SOURCE_URL
      });
    }
  }

  // Assign IDs and current date
  const today = new Date().toISOString().split('T')[0];
  let id = 1;
  return Array.from(merged.values()).map(d => ({
    id: id++,
    company: d.company,
    sector: d.sector,
    policy: d.policy,
    daysInOffice: d.daysInOffice,
    enforcement: d.enforcement,
    lastUpdate: today,
    source: d.source
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] RTO Scraper starting...`);
  console.log(`Fetching: ${BUILDREMOTE_URL}`);

  let scraped = [];
  try {
    const html = await fetchPage(BUILDREMOTE_URL);
    scraped = parseTable(html);
    console.log(`Scraped ${scraped.length} companies from BuildRemote`);
  } catch (err) {
    console.warn(`Scrape failed (${err.message}). Using curated data only.`);
  }

  const finalData = mergeData(scraped, CURATED_DATA);
  console.log(`Final dataset: ${finalData.length} companies`);

  // Ensure output directory exists
  const dir = './public/data';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalData, null, 2));
  console.log(`Written to ${OUTPUT_PATH}`);
  console.log(`[${new Date().toISOString()}] Done.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
