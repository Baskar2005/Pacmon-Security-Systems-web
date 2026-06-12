const fs = require('fs');
const path = require('path');
const RSSParser = require('rss-parser');
const sanitizeHtml = require('sanitize-html');
const fetch = require('node-fetch');
const parser = new RSSParser({timeout:15000});

const FEEDS_FILE = path.join(__dirname, 'feeds.json');
const OUT_DIR = path.join(__dirname, '..', 'news');
const OUT_FILE = path.join(OUT_DIR, 'data.json');
const ASSETS_DIR = path.join(OUT_DIR, 'assets');

if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if(!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

async function loadFeeds(){
  return JSON.parse(fs.readFileSync(FEEDS_FILE, 'utf8'));
}

function safeText(txt){
  if(!txt) return '';
  const clean = sanitizeHtml(txt, {allowedTags:[], allowedAttributes:{}});
  return clean.replace(/\s+/g,' ').trim();
}

function pickImage(item){
  if(!item) return null;
  if(item.enclosure && item.enclosure.url) return item.enclosure.url;
  if(item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) return item['media:content']['$'].url;
  if(item.content) {
    const m = item.content.match(/<img[^>]+src=["']?([^"' >]+)/i);
    if(m) return m[1];
  }
  if(item['media:thumbnail'] && item['media:thumbnail'].url) return item['media:thumbnail'].url;
  return null;
}

function toISO(d){
  try{ return new Date(d).toISOString(); }catch(e){ return new Date().toISOString(); }
}

function safeFilename(str){
  if(!str) str = Math.random().toString(36).slice(2,8);
  return str.replace(/[^a-z0-9-_\.]/gi,'_').slice(0,80);
}

async function downloadImage(url, destPath){
  if(!url) return null;
  try{
    const res = await fetch(url, { timeout: 15000 });
    if(!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    let ext = '.jpg';
    if(contentType.includes('png')) ext = '.png';
    else if(contentType.includes('gif')) ext = '.gif';
    else if(contentType.includes('webp')) ext = '.webp';

    const filename = safeFilename(path.basename(destPath)) + ext;
    const outFile = path.join(ASSETS_DIR, filename);
    // skip download if exists
    if(fs.existsSync(outFile)) return path.posix.join('news','assets', filename);

    const fileStream = fs.createWriteStream(outFile);
    await new Promise((resolve, reject)=>{
      res.body.pipe(fileStream);
      res.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    return path.posix.join('news','assets', filename);
  }catch(e){
    return null;
  }
}

async function fetchFeedWithRetry(url, attempts = 3){
  for(let i=0;i<attempts;i++){
    try{
      return await parser.parseURL(url);
    }catch(e){
      if(i === attempts-1) throw e;
      await new Promise(r=>setTimeout(r, 1000 * (i+1)));
    }
  }
}

(async function main(){
  const feeds = await loadFeeds();
  const results = [];
  for(const f of feeds){
    try{
      console.log('Fetching', f.url);
      const feed = await fetchFeedWithRetry(f.url);
      const items = feed.items || [];
      for(const it of items){
        const link = it.link || it.guid || it.id;
        if(!link) continue;
        const title = safeText(it.title || it.summary || link.substring(0,60));
        const summary = safeText(it.contentSnippet || it.content || it.summary || '');
        const rawImage = pickImage(it);
        const pubDate = it.pubDate || it.isoDate || (it.published ? it.published : new Date().toISOString());

        // provisional id
        const baseId = (it.guid || link || title).slice(0,100);
        const id = safeFilename(baseId);

        results.push({
          id: id,
          title: title,
          cat: f.cat || 'it',
          summary: summary.length>240 ? summary.slice(0,237)+'...' : summary,
          url: link,
          rawImage: rawImage,
          pubDate: toISO(pubDate),
          source: f.source || (feed.title||'')
        });
      }
    }catch(e){
      console.error('Feed error', f.url, e.message);
    }
  }

  // dedupe by url and sort by pubDate
  const map = new Map();
  results.sort((a,b)=> new Date(b.pubDate) - new Date(a.pubDate));
  for(const r of results){
    if(!map.has(r.url)) map.set(r.url, r);
  }
  const out = Array.from(map.values()).slice(0,200);

  // download images (best-effort) and normalize
  const normalized = [];
  for(const o of out){
    let imagePath = '';
    if(o.rawImage){
      try{
        imagePath = await downloadImage(o.rawImage, o.id);
      }catch(e){ imagePath = ''; }
    }
    normalized.push({id:o.id,title:o.title,cat:o.cat,summary:o.summary,url:o.url,image:imagePath || '',pubDate:o.pubDate});
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('Wrote', OUT_FILE, 'items=', normalized.length);
})();
