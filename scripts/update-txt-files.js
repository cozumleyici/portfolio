const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Admin panelindeki localStorage verilerini public klasörüne yaz
const updateTXTFilesFromLocalStorage = () => {
  try {
    // localStorage'dan verileri almak için HTML dosyası oluştur
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Update TXT Files from Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        textarea { width: 100%; height: 200px; margin: 10px 0; }
        .result { margin: 10px 0; padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <h1>Update TXT Files from Admin Panel</h1>
    <button onclick="updateTXTFiles()">Update TXT Files</button>
    <div id="result"></div>
    
    <script>
        function updateTXTFiles() {
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
                    alert('File contents copied! Now run: npm run update-txt-files');
                });
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        }
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(__dirname, 'update-from-admin.html'), html);
    console.log('Created update-from-admin.html');
    console.log('Open this file in browser, then run: npm run update-txt-files');
    
  } catch (error) {
    console.error('Error creating HTML:', error);
  }
};

// TXT dosyalarını güncelle ve deploy yap
const updateAndDeploy = (fileContents) => {
  const projectDir = path.join(__dirname, '..');
  const publicDir = path.join(projectDir, 'public');
  
  try {
    console.log('Updating TXT files...');
    
    // TXT dosyalarını public klasörüne yaz
    Object.entries(fileContents).forEach(([filename, content]) => {
      const filePath = path.join(publicDir, filename);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filename}: ${content}`);
    });
    
    console.log('TXT files updated successfully!');
    
    // Git operations
    return new Promise((resolve, reject) => {
      exec('git add .', { cwd: projectDir }, (error, stdout, stderr) => {
        if (error) {
          console.error('Git add error:', error);
          reject(error);
          return;
        }
        
        console.log('Git add completed');
        
        exec('git commit -m "Update TXT files via admin panel"', { cwd: projectDir }, (error, stdout, stderr) => {
          if (error) {
            console.error('Git commit error:', error);
            console.error('Stderr:', stderr);
            reject(error);
            return;
          }
          
          console.log('Git commit completed');
          
          exec('git push origin main', { cwd: projectDir }, (error, stdout, stderr) => {
            if (error) {
              console.error('Git push error:', error);
              console.error('Stderr:', stderr);
              reject(error);
              return;
            }
            
            console.log('Git push completed');
            console.log('Successfully pushed to GitHub!');
            console.log('Vercel will automatically deploy changes.');
            resolve('Deploy successful!');
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error updating files:', error);
    throw error;
  }
};

// Command line'dan dosya içerikleri ile güncelle ve deploy
if (process.argv.length > 2) {
  try {
    const fileContents = JSON.parse(process.argv[2]);
    updateAndDeploy(fileContents)
      .then(() => {
        console.log('TXT files updated and deployed successfully!');
      })
      .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Error parsing JSON:', error);
    process.exit(1);
  }
} else {
  updateTXTFilesFromLocalStorage();
}
