import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('E:\\KyberGym Management\\frontend\\src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updatedContent = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\//g, '@/');
  if (content !== updatedContent) {
    fs.writeFileSync(file, updatedContent, 'utf8');
    changed++;
  }
});

console.log(`Updated ${changed} files.`);
