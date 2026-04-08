'use client';

import { useState } from 'react';
import { FaDownload, FaFileArchive, FaFileAlt } from 'react-icons/fa';

const FilesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const files = [
    {
      name: 'BillboardReklam.zip',
      size: '8.5 MB',
      type: 'zip',
      description: 'Billboard reklam uygulaması'
    },
    {
      name: 'DosyaArsivlemeZip.zip',
      size: '710 KB',
      type: 'zip',
      description: 'Dosya arşivleme uygulaması'
    },
    {
      name: 'ExcelArama.zip',
      size: '11.3 MB',
      type: 'zip',
      description: 'Excel arama uygulaması'
    },
    {
      name: 'ExcelAramaLink.zip',
      size: '3.1 MB',
      type: 'zip',
      description: 'Excel arama link uygulaması'
    },
    {
      name: 'TespitKontrol.zip',
      size: '7.9 MB',
      type: 'zip',
      description: 'Tespit kontrol uygulaması'
    },
    {
      name: 'vers_kontrolu.txt',
      size: '7 B',
      type: 'txt',
      description: 'Versiyon kontrol dosyası'
    },
    {
      name: 'vers_kontroluBillboard.txt',
      size: '8 B',
      type: 'txt',
      description: 'Billboard versiyon kontrolü'
    },
    {
      name: 'vers_kontroluCBS.txt',
      size: '7 B',
      type: 'txt',
      description: 'CBS versiyon kontrolü'
    },
    {
      name: 'vers_kontroluExcelArama.txt',
      size: '7 B',
      type: 'txt',
      description: 'Excel arama versiyon kontrolü'
    },
    {
      name: 'vers_kontroluTespitKontrol.txt',
      size: '8 B',
      type: 'txt',
      description: 'Tespit kontrol versiyon kontrolü'
    }
  ];

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type) => {
    return type === 'zip' ? <FaFileArchive className="text-blue-500" /> : <FaFileAlt className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dosya İndirme Merkezi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Tüm uygulamama ve versiyon kontrol dosyalarını buradan indirebilirsiniz
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Dosya ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.size}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {file.description}
              </p>
              
              <a
                href={`/files/${file.name}`}
                download
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload size={16} />
                <span>İndir</span>
              </a>
            </div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Arama kriterinize uygun dosya bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesPage;
