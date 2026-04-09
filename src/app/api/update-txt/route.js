import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { files } = body;
    
    if (!files) {
      return NextResponse.json({ error: 'No files data provided' }, { status: 400 });
    }
    
    const publicDir = path.join(process.cwd(), 'public');
    
    // TXT dosyalarýný güncelle
    const updates = {};
    
    // vers_kontrolu.txt
    if (files.vers_kontrolu !== undefined) {
      const filePath = path.join(publicDir, 'vers_kontrolu.txt');
      fs.writeFileSync(filePath, files.vers_kontrolu, 'utf8');
      updates['vers_kontrolu.txt'] = files.vers_kontrolu;
    }
    
    // vers_kontroluBillboard.txt
    if (files.vers_kontroluBillboard !== undefined) {
      const filePath = path.join(publicDir, 'vers_kontroluBillboard.txt');
      fs.writeFileSync(filePath, files.vers_kontroluBillboard, 'utf8');
      updates['vers_kontroluBillboard.txt'] = files.vers_kontroluBillboard;
    }
    
    // vers_kontroluCBS.txt
    if (files.vers_kontroluCBS !== undefined) {
      const filePath = path.join(publicDir, 'vers_kontroluCBS.txt');
      fs.writeFileSync(filePath, files.vers_kontroluCBS, 'utf8');
      updates['vers_kontroluCBS.txt'] = files.vers_kontroluCBS;
    }
    
    // vers_kontroluExcelArama.txt
    if (files.vers_kontroluExcelArama !== undefined) {
      const filePath = path.join(publicDir, 'vers_kontroluExcelArama.txt');
      fs.writeFileSync(filePath, files.vers_kontroluExcelArama, 'utf8');
      updates['vers_kontroluExcelArama.txt'] = files.vers_kontroluExcelArama;
    }
    
    // vers_kontroluTespitKontrol.txt
    if (files.vers_kontroluTespitKontrol !== undefined) {
      const filePath = path.join(publicDir, 'vers_kontroluTespitKontrol.txt');
      fs.writeFileSync(filePath, files.vers_kontroluTespitKontrol, 'utf8');
      updates['vers_kontroluTespitKontrol.txt'] = files.vers_kontroluTespitKontrol;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'TXT files updated successfully',
      updatedFiles: updates 
    });
    
  } catch (error) {
    console.error('Error updating TXT files:', error);
    return NextResponse.json({ 
      error: 'Failed to update TXT files',
      details: error.message 
    }, { status: 500 });
  }
}
