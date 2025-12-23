import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');

function checkExports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      checkExports(filePath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasDefaultExport = content.includes('export default');
      
      if (!hasDefaultExport) {
        console.error(`❌ ${filePath} is missing default export`);
      } else {
        console.log(`✅ ${filePath} has default export`);
      }
    }
  });
}

checkExports(pagesDir);