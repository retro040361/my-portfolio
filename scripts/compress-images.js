const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_DIR = path.join(__dirname, '../public/image');
const MAX_DIMENSION = 1600; // 網頁圖片最大長邊長度 1600px
const QUALITY = 82;         // 高畫質 82% 壓縮比

// 遞迴取得資料夾下所有檔案
function getAllImageFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllImageFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function compressImage(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);

    // 如果檔案大於 300KB (307,200 bytes)，進行壓縮優化
    if (stats.size < 300 * 1024) {
      return null;
    }

    const originalSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let transform = image;
    
    // 如果圖片寬或高超過 1600px，進行等比例縮放
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      transform = transform.resize({
        width: metadata.width > metadata.height ? MAX_DIMENSION : null,
        height: metadata.height >= metadata.width ? MAX_DIMENSION : null,
        withoutEnlargement: true
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    let buffer;

    if (ext === '.png') {
      buffer = await transform.png({ quality: QUALITY, compressionLevel: 8 }).toBuffer();
    } else {
      buffer = await transform.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    }

    // 只有當壓縮後檔案確實變小時才覆寫
    if (buffer.length < stats.size) {
      fs.writeFileSync(filePath, buffer);
      const newSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      const savedMB = (originalSizeMB - newSizeMB).toFixed(2);
      return {
        file: path.relative(path.join(__dirname, '../public'), filePath),
        originalSizeMB,
        newSizeMB,
        savedMB
      };
    }
  } catch (err) {
    // 寫入寫入中例外防護
  }
  return null;
}

async function run() {
  console.log('⚡ 正在檢查並自動優化專案圖片庫...');
  const images = getAllImageFiles(IMAGE_DIR);
  let totalSavedBytes = 0;
  let compressedCount = 0;

  for (const imgPath of images) {
    const result = await compressImage(imgPath);
    if (result) {
      compressedCount++;
      totalSavedBytes += (parseFloat(result.savedMB));
      console.log(`✅ [壓縮成功] ${result.file}: ${result.originalSizeMB} MB -> ${result.newSizeMB} MB (節省 ${result.savedMB} MB)`);
    }
  }

  if (compressedCount > 0) {
    console.log(`🎉 圖片優化完成！共壓縮 ${compressedCount} 張大圖，總共省下了約 ${totalSavedBytes.toFixed(2)} MB 記憶體空間！\n`);
  } else {
    console.log('✨ 所有圖片均已是輕量化最佳狀態，無需重複壓縮。\n');
  }
}

async function startWatchMode() {
  await run();
  console.log('👀 [Watch Mode] 已啟動圖片實時監聽器！隨時放置新照片，將會自動實時壓縮無感處理...\n');

  const processingFiles = new Set();

  fs.watch(IMAGE_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    const ext = path.extname(filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

    const fullPath = path.join(IMAGE_DIR, filename);
    if (processingFiles.has(fullPath)) return;

    processingFiles.add(fullPath);
    
    // 延遲 600ms 確保檔案由作業系統複製完成
    setTimeout(async () => {
      if (fs.existsSync(fullPath)) {
        const result = await compressImage(fullPath);
        if (result) {
          console.log(`⚡ [即時自動壓縮] ${result.file}: ${result.originalSizeMB} MB -> ${result.newSizeMB} MB (節省 ${result.savedMB} MB)`);
        }
      }
      processingFiles.delete(fullPath);
    }, 600);
  });
}

const isWatch = process.argv.includes('--watch');
if (isWatch) {
  startWatchMode();
} else {
  run();
}
