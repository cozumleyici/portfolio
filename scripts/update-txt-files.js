const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Mevcut TXT dosyalarýný güncelle ve deploy yap
const updateAndDeploy = () => {
  const projectDir = path.join(__dirname, '..');
  
  try {
    console.log('Starting TXT files update and deploy...');
    
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
            reject(error);
            return;
          }
          
          console.log('Git commit completed');
          
          exec('git push origin main', { cwd: projectDir }, (error, stdout, stderr) => {
            if (error) {
              console.error('Git push error:', error);
              reject(error);
              return;
            }
            
            console.log('Git push completed');
            console.log('Successfully pushed to GitHub!');
            console.log('Vercel will automatically deploy the changes.');
            resolve('Deploy successful!');
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error in update and deploy:', error);
    throw error;
  }
};

// Script'i doðrudan çalýþtýr
updateAndDeploy()
  .then(() => {
    console.log('TXT files updated and deployed successfully!');
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
