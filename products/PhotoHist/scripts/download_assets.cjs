const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const USER_AGENT = 'HistoryZNOEducationalApp/1.0 (contact@zno-history.ua)';

function downloadUrl(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
    });
    req.on('error', reject);
  });
}

async function resolveCommonsImageUrl(fileName, width = 800) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json`;
  return new Promise(r => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          const p = Object.values(json.query.pages)[0];
          r(p.imageinfo ? (p.imageinfo[0].thumburl || p.imageinfo[0].url) : null);
        } catch(e) { r(null); }
      });
    });
  });
}

async function resolveUkWikiImageUrl(fileName, width = 800) {
  const url = `https://uk.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json`;
  return new Promise(r => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          const p = Object.values(json.query.pages)[0];
          r(p.imageinfo ? (p.imageinfo[0].thumburl || p.imageinfo[0].url) : null);
        } catch(e) { r(null); }
      });
    });
  });
}

module.exports = { downloadUrl, resolveCommonsImageUrl, resolveUkWikiImageUrl };
