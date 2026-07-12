import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.js')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('E:\\KyberGym Management\\backend\\src\\modules');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Depth calculation: src/modules/moduleName/file.js -> 3 parts after src
  // Wait, let's just calculate relative path from the file to src/shared
  
  const sharedDir = 'E:\\KyberGym Management\\backend\\src\\shared';
  const fileDir = path.dirname(file);
  
  // Calculate relative path from fileDir to sharedDir
  let relativePath = path.relative(fileDir, sharedDir).replace(/\\/g, '/');
  
  // if relativePath is not starting with '.', add './'
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // We want to replace import { ... } from '../../../shared/...'; with the correct relativePath
  // Let's just replace all instances of `../../../shared` with the correct relative path
  let updatedContent = content.replace(/['"]\.\.\/\.\.\/\.\.\/shared\/(.*?)['"]/g, `'${relativePath}/$1'`);
  
  if (content !== updatedContent) {
    console.log(`Updated ${file}`);
    fs.writeFileSync(file, updatedContent, 'utf8');
  }
});
