import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import * as musicMetadata from 'music-metadata-browser';
import exifr from 'exifr';

function App() {
  const [md5Hash, setMd5Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const [fileInfo, setFileInfo] = useState({});
  const [ipInfo, setIpInfo] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [ipInputValue, setIpInputValue] = useState('');
  const [ipLookupError, setIpLookupError] = useState(null);
  const [metadataError, setMetadataError] = useState(null);

  // File Integrity Checker & File Size
  const handleIntegrityCheck = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      const md5 = CryptoJS.MD5(wordArray).toString();
      const sha256 = CryptoJS.SHA256(wordArray).toString();
      setMd5Hash(md5);
      setSha256Hash(sha256);
      setFileInfo({ size: file.size });
    };
    reader.readAsArrayBuffer(file);
  };

  // IP/URL Lookup
  const handleIpLookup = async () => {
    setIpLookupError(null);
    if (!ipInputValue.trim()) {
        setIpLookupError('Please enter an IP address or URL.');
        return;
    }

    // Ganti dengan API Key AbuseIPDB Anda
    const apiKey = '5f8ed2e84aa9b82f6c930a0569f4892caf859a87a85cb439532249ea2097d24496834e9b583d0e59';
    const apiUrl = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ipInputValue}&maxAgeInDays=90`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('AbuseIPDB API Error. Check API key or IP address.');
        }

        const data = await response.json();
        const report = data.data;
        
        // Memformat data dari AbuseIPDB
        const formattedData = {
            ipAddress: report.ipAddress,
            isPublic: report.isPublic,
            abuseConfidenceScore: report.abuseConfidenceScore,
            countryCode: report.countryCode,
            isp: report.isp,
            domain: report.domain,
            totalReports: report.totalReports,
        };

        setIpInfo(JSON.stringify(formattedData, null, 2));
    } catch (error) {
        console.error('IP Lookup Error:', error);
        setIpLookupError('Something went wrong with the AbuseIPDB lookup.');
    }
};

  // Metadata Extractor (Diperbarui untuk menggunakan exifr dan music-metadata-browser)
  const handleMetadataExtraction = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMetadata(null);
      setMetadataError(null);
      return;
    }
    setMetadataError(null);
    setMetadata(null);

    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      // Gunakan exifr untuk file gambar
      exifr.parse(file)
        .then(extracted => {
          if (extracted && Object.keys(extracted).length > 0) {
            setMetadata(extracted);
          } else {
            setMetadataError('No EXIF metadata found in this image.');
          }
        })
        .catch(err => {
          setMetadataError('Error parsing image metadata.');
          console.error(err);
        });
    } else if (fileType.startsWith('audio/')) {
      // Gunakan music-metadata-browser untuk file audio
      musicMetadata.parseBlob(file)
        .then((meta) => {
          const common = meta.common;
          const extracted = {
            title: common.title,
            artist: common.artist,
            album: common.album,
            year: common.year,
          };
          setMetadata(extracted);
        })
        .catch((error) => {
          setMetadataError('Unable to extract metadata from this audio file.');
          console.error('Metadata Error:', error);
        });
    } else {
      // Tipe file tidak didukung
      setMetadataError('Unsupported file type. Please upload an image or audio file.');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-wider">🎯 Digital Forensics Toolkit</h1>
          <p className="mt-2 text-gray-400">A simple, client-side toolkit for basic digital forensics tasks.</p>
        </header>
        
        {/* File Integrity Checker Section */}
        <section className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">File Integrity Checker</h2>
          <p className="text-gray-400 mb-4">Calculate and verify file hashes (MD5, SHA-256) and size directly in your browser.</p>
          <input 
            type="file" 
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
            onChange={handleIntegrityCheck}
          />
          <div className="mt-4 p-4 bg-gray-700 rounded-md">
            <p><strong>MD5 Hash:</strong> {md5Hash || 'N/A'}</p>
            <p><strong>SHA256 Hash:</strong> {sha256Hash || 'N/A'}</p>
            <p><strong>File Size:</strong> {fileInfo?.size ? `${fileInfo.size} bytes` : 'N/A'}</p>
          </div>
        </section>

        {/* IP/URL Lookup Section */}
        <section className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">IP/URL Lookup</h2>
          <p className="text-gray-400 mb-4">Lookup detailed information for any IP address or URL.</p>
          <div className="flex">
            <input 
              type="text"
              value={ipInputValue}
              onChange={(e) => setIpInputValue(e.target.value)}
              placeholder="Enter IP or URL"
              className="flex-grow p-2 rounded-l-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleIpLookup}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Lookup
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-700 rounded-md">
            {ipLookupError ? (
              <p className="text-red-400">{ipLookupError}</p>
            ) : (
              <pre className="whitespace-pre-wrap">{ipInfo || 'Results will appear here...'}</pre>
            )}
          </div>
        </section>

        {/* File Metadata Extractor Section */}
        <section className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">File Metadata Extractor</h2>
          <p className="text-gray-400 mb-4">Extract hidden metadata from various file types.</p>
          <input 
            type="file" 
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
            onChange={handleMetadataExtraction}
          />
          <div className="mt-4 p-4 bg-gray-700 rounded-md">
            {metadataError ? (
              <p className="text-red-400">{metadataError}</p>
            ) : metadata ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Extracted Metadata:</h3>
                <ul className="list-disc list-inside">
                  {Object.entries(metadata).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Results will appear here...</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;