const fs = require('fs');
const path = require('path');

// Admin panelinden localStorage'dan veri almak için HTML dosyasý oluþtur
const createUpdaterHTML = () => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>TXT Files Updater</title>
</head>
<body>
    <h1>TXT Files Updater</h1>
    <button onclick="updateFiles()">Update TXT Files</button>
    <div id="result"></div>
    
    <script>
        function updateFiles() {
            try {
                // localStorage'dan verileri al
                const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
                const files = portfolioData.files || {};
                
                const fileContents = {
                    'vers_kontrolu.txt': files.vers_kontrolu || '1.0.0.1',
                    'vers_kontroluBillboard.txt': files.vers_kontroluBillboard || '1.0.0.29',
                    'vers_kontroluCBS.txt': files.vers_kontroluCBS || '1.0.0.2',
                    'vers_kontroluExcelArama.txt': files.vers_kontroluExcelArama || '1.0.0.8',
                    'vers_kontroluTespitKontrol.txt': files.vers_kontroluTespitKontrol || '1.0.0.33'
                };
                
                // Dosya içeriklerini göster
                let result = '<h3>Updated Files:</h3>';
                Object.entries(fileContents).forEach(([filename, content]) => {
                    result += \`\${filename}: \${content}<br>\`;
                });
                
                document.getElementById('result').innerHTML = result;
                
                // Verileri clipboard'a kopyala
                const dataToCopy = JSON.stringify(fileContents, null, 2);
                navigator.clipboard.writeText(dataToCopy).then(() => {
                    alert('File contents copied to clipboard! Paste into the update script.');
                });
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        }
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(__dirname, 'update-txt-files.html'), html);
  console.log('Created update-txt-files.html');
};

// TXT dosyalarýný güncelleme script'i
const updateTXTFiles = (fileContents) => {
  const publicDir = path.join(__dirname, '..', 'public');
  
  Object.entries(fileContents).forEach(([filename, content]) => {
    const filePath = path.join(publicDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filename}: ${content}`);
  });
};

// Command line'dan dosya içerikleri ile güncelle
if (process.argv.length > 2) {
  try {
    const fileContents = JSON.parse(process.argv[2]);
    updateTXTFiles(fileContents);
    console.log('TXT files updated successfully!');
  } catch (error) {
    console.error('Error updating files:', error);
  }
} else {
  createUpdaterHTML();
  console.log('Run this script with file contents as JSON argument');
  console.log('Or open update-txt-files.html in browser to extract data from localStorage');
}
