const fs = require('fs');
const xml = fs.readFileSync('seed_temp/word/document.xml', 'utf8');
const paragraphs = xml.match(/<w:p[^>]*>.*?<\/w:p>/g) || [];
const text = paragraphs.map(p => {
    const texts = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
    return texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
}).join('\n\n');
fs.writeFileSync('seed_text.md', text);
