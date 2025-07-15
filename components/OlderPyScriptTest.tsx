'use client';

import { useState, useEffect } from 'react';

export default function OlderPyScriptTest() {
  const [status, setStatus] = useState<string>('Starting...');

  useEffect(() => {
    const runTest = async () => {
      try {
        setStatus('Setting up older PyScript test...');
        
        // Clear any existing elements
        document.querySelectorAll('py-config').forEach(el => el.remove());
        document.querySelectorAll('py-script').forEach(el => el.remove());
        document.querySelectorAll('link[href*="pyscript"]').forEach(el => el.remove());
        document.querySelectorAll('script[src*="pyscript"]').forEach(el => el.remove());
        
        setTimeout(() => {
          setStatus('Creating older PyScript test...');
          
          // Create a container for the test
          const container = document.querySelector('[data-testid="older-container"]');
          if (!container) return;
          
          // Try PyScript 2023.12.1 (older, more stable version)
          container.innerHTML = `
            <link rel="stylesheet" href="https://pyscript.net/releases/2023.12.1/core.css">
            <script type="module" src="https://pyscript.net/releases/2023.12.1/core.js"></script>
            
            <div style="margin: 20px 0; padding: 10px; background: #f0f0f0; border: 1px solid #ccc;">
              <h3>Older PyScript Test Output:</h3>
              <div id="older-output" style="font-family: monospace; white-space: pre-wrap;"></div>
            </div>
            
            <py-script output="older-output">
print("=== Older PyScript Test (2023.12.1) ===")
print("Testing basic Python execution...")
result = 20 + 25
print(f"20 + 25 = {result}")
print("If you see this, older PyScript is working!")
print("=== Test Complete ===")
            </py-script>
          `;
          
          setStatus('Older PyScript test created - waiting for execution...');
          
          // Check for output after a delay
          setTimeout(() => {
            const output = document.getElementById('older-output');
            if (output && output.textContent && output.textContent.includes('Older PyScript Test')) {
              setStatus('✅ Older PyScript is working!');
            } else {
              setStatus('❌ Older PyScript also not working');
            }
          }, 8000);
          
        }, 1000);
        
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      }
    };

    runTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Older PyScript Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600 font-mono">{status}</p>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">This test:</h3>
        <ul className="text-sm space-y-1">
          <li>• ✅ Uses PyScript 2023.12.1 (older, more stable)</li>
          <li>• ✅ Sometimes newer versions have bugs</li>
          <li>• ✅ Older versions might work better</li>
          <li>• ✅ Tests basic Python functionality</li>
        </ul>
      </div>
      
      <div data-testid="older-container">
        {/* PyScript HTML will be inserted here */}
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Output:</h3>
        <div className="text-sm font-mono bg-white p-2 rounded">
          === Older PyScript Test (2023.12.1) ===<br/>
          Testing basic Python execution...<br/>
          20 + 25 = 45<br/>
          If you see this, older PyScript is working!<br/>
          === Test Complete ===
        </div>
      </div>
    </div>
  );
} 