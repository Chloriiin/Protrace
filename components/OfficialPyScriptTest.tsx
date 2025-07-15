'use client';

import { useState, useEffect } from 'react';

export default function OfficialPyScriptTest() {
  const [status, setStatus] = useState<string>('Starting...');

  useEffect(() => {
    const runTest = async () => {
      try {
        setStatus('Setting up official PyScript test...');
        
        // Clear any existing elements
        document.querySelectorAll('py-config').forEach(el => el.remove());
        document.querySelectorAll('py-script').forEach(el => el.remove());
        document.querySelectorAll('link[href*="pyscript"]').forEach(el => el.remove());
        document.querySelectorAll('script[src*="pyscript"]').forEach(el => el.remove());
        
        setTimeout(() => {
          setStatus('Creating HTML-based PyScript test...');
          
          // Create a container for the test
          const container = document.querySelector('[data-testid="official-container"]');
          if (!container) return;
          
          // Add PyScript HTML directly
          container.innerHTML = `
            <link rel="stylesheet" href="https://pyscript.net/releases/2024.1.1/core.css">
            <script type="module" src="https://pyscript.net/releases/2024.1.1/core.js"></script>
            
            <div style="margin: 20px 0; padding: 10px; background: #f0f0f0; border: 1px solid #ccc;">
              <h3>PyScript Test Output:</h3>
              <div id="official-output" style="font-family: monospace; white-space: pre-wrap;"></div>
            </div>
            
            <py-script output="official-output">
print("=== Official PyScript Test ===")
print("Testing basic Python execution...")
result = 10 + 5
print(f"10 + 5 = {result}")
print("If you see this, PyScript is working!")
print("=== Test Complete ===")
            </py-script>
          `;
          
          setStatus('HTML-based PyScript test created - waiting for execution...');
          
          // Check for output after a delay
          setTimeout(() => {
            const output = document.getElementById('official-output');
            if (output && output.textContent && output.textContent.includes('Official PyScript Test')) {
              setStatus('✅ PyScript is working with HTML approach!');
            } else {
              setStatus('❌ PyScript still not working');
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
      <h1 className="text-2xl font-bold mb-4">Official PyScript Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600 font-mono">{status}</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">This test:</h3>
        <ul className="text-sm space-y-1">
          <li>• ✅ Uses official PyScript HTML approach</li>
          <li>• ✅ Static HTML instead of dynamic loading</li>
          <li>• ✅ Should work if PyScript works at all</li>
          <li>• ✅ Tests the most basic PyScript functionality</li>
        </ul>
      </div>
      
      <div data-testid="official-container">
        {/* PyScript HTML will be inserted here */}
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Output:</h3>
        <div className="text-sm font-mono bg-white p-2 rounded">
          === Official PyScript Test ===<br/>
          Testing basic Python execution...<br/>
          10 + 5 = 15<br/>
          If you see this, PyScript is working!<br/>
          === Test Complete ===
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-red-50 rounded-lg">
        <h3 className="font-semibold mb-2">If no output appears:</h3>
        <p className="text-sm">
          This confirms that PyScript itself is not working properly in this environment.
          We may need to try a different PyScript version or approach.
        </p>
      </div>
    </div>
  );
} 