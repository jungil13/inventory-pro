const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', '..', 'src');

const replacements = [
  { regex: /blue-/g, replacement: 'red-' },
  { regex: /indigo-/g, replacement: 'red-' },
  { regex: /cyan-/g, replacement: 'red-' },
  { regex: /violet-/g, replacement: 'red-' },
  { regex: /purple-/g, replacement: 'red-' },
  { regex: /teal-/g, replacement: 'red-' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Theme color replacement complete.");
