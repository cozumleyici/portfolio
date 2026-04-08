const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Admin panelinden localStorage'dan veri almak için HTML dosyasý oluþtur
const createUpdaterHTML = () => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>TXT Files Updater & Deploy</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        textarea { width: 100%; height: 200px; margin: 10px 0; }
        .result { margin: 10px 0; padding: 10px; background: #f8f9fa; border: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <h1>TXT Files Updater & Deploy</h1>
    <button onclick="updateFiles()">1. Get Data from Admin Panel</button>
    <button onclick="deployFiles()" id="deployBtn" disabled>2. Deploy to Vercel</button>
    
    <div id="result"></div>
    <textarea id="jsonOutput" placeholder="JSON data will appear here..." readonly></textarea>
    
    <script>
        let fileContents = {};
        
        function updateFiles() {
            try {
                // localStorage'dan verileri al
                const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{}');
                const files = portfolioData.files || {};
                
                fileContents = {
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
                document.getElementById('jsonOutput').value = JSON.stringify(fileContents, null, 2);
                document.getElementById('deployBtn').disabled = false;
                
                alert('File data extracted! Now click "Deploy to Vercel"');
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        }
        
        function deployFiles() {
            const jsonOutput = document.getElementById('jsonOutput').value;
            if (!jsonOutput) {
                alert('Please first get data from admin panel!');
                return;
            }
            
            // Verileri clipboard'a kopyala
            navigator.clipboard.writeText(jsonOutput).then(() => {
                alert('Data copied to clipboard! Now run: npm run update-and-deploy');
                window.open('https://vercel.com/dashboard', '_blank');
            });
        }
    </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(__dirname, 'update-txt-files.html'), html);
  console.log('Created update-txt-files.html');
};

// TXT dosyalarýný güncelleme ve deploy script'i
const updateAndDeploy = (fileContents) => {
  const publicDir = path.join(__dirname, '..', 'public');
  
  try {
    // TXT dosyalarýný güncelle
    Object.entries(fileContents).forEach(([filename, content]) => {
      const filePath = path.join(publicDir, filename);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filename}: ${content}`);
    });
    
    console.log('TXT files updated successfully!');
    
    // Git operations
    const projectDir = path.join(__dirname, '..');
    
    return new Promise((resolve, reject) => {
      exec('git add .', { cwd: projectDir }, (error, stdout, stderr) => {
        if (error) {
          console.error('Git add error:', error);
          reject(error);
          return;
        }
        
        exec('git commit -m "Update TXT files via admin panel"', { cwd: projectDir }, (error, stdout, stderr) => {
          if (error) {
            console.error('Git commit error:', error);
            reject(error);
            return;
          }
          
          exec('git push origin main', { cwd: projectDir }, (error, stdout, stderr) => {
            if (error) {
              console.error('Git push error:', error);
              reject(error);
              return;
            }
            
            console.log('Successfully updated TXT files and pushed to GitHub!');
            console.log('Vercel will automatically deploy the changes.');
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
  createUpdaterHTML();
  console.log('Run this script with file contents as JSON argument');
  console.log('Or open update-txt-files.html in browser to extract data from localStorage');
  console.log('Then run: npm run update-and-deploy');
}
