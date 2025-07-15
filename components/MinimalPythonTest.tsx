'use client';

import { useState, useEffect } from 'react';

export default function MinimalPythonTest() {
  const [status, setStatus] = useState<string>('Starting...');

  useEffect(() => {
    const runTest = async () => {
      try {
        setStatus('Cleaning up...');
        
        // Clean up everything
        document.querySelectorAll('py-config').forEach(el => el.remove());
        document.querySelectorAll('py-script').forEach(el => el.remove());
        document.querySelectorAll('link[href*="pyscript"]').forEach(el => el.remove());
        document.querySelectorAll('script[src*="pyscript"]').forEach(el => el.remove());
        
        setTimeout(() => {
          setStatus('Loading PyScript...');
          
          // Load PyScript CSS
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
          document.head.appendChild(cssLink);
          
          // NO py-config at all - just basic Python
          
          // Load PyScript
          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
          document.head.appendChild(script);
          
          script.onload = () => {
            setStatus('PyScript loaded, testing basic Python...');
            
            // Minimal wait, then test basic Python
            setTimeout(() => {
              setStatus('Creating Python test...');
              
              // Create output div
              const outputDiv = document.createElement('div');
              outputDiv.id = 'minimal-output';
              outputDiv.style.padding = '10px';
              outputDiv.style.background = '#f0f0f0';
              outputDiv.style.border = '1px solid #ccc';
              outputDiv.style.marginTop = '20px';
              outputDiv.style.fontFamily = 'monospace';
              outputDiv.innerHTML = '<h3>Python Output:</h3>';
              
              const container = document.querySelector('[data-testid="minimal-container"]');
              if (container) {
                container.appendChild(outputDiv);
              }
              
              // Ultra-simple Python test
              const testScript = document.createElement('py-script');
              testScript.setAttribute('output', 'minimal-output');
              testScript.innerHTML = `
print("Hello from Python!")
print("Testing basic operations...")
result = 2 + 3
print(f"2 + 3 = {result}")
print("Basic Python is working!")
              `;
              
              document.body.appendChild(testScript);
              
              setStatus('Python test created - waiting for execution...');
              
              // Check if output appears
              setTimeout(() => {
                const output = document.getElementById('minimal-output');
                if (output && output.innerHTML.includes('Hello from Python!')) {
                  setStatus('✅ Python is working!');
                } else {
                  setStatus('❌ Python execution failed');
                }
              }, 5000);
              
            }, 3000); // Short wait, no packages to install
          };
          
          script.onerror = () => {
            setStatus('❌ Failed to load PyScript');
          };
          
        }, 1000);
        
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      }
    };

    runTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Minimal Python Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600 font-mono">{status}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">This test:</h3>
        <ul className="text-sm space-y-1">
          <li>• ✅ NO packages required</li>
          <li>• ✅ NO py-config needed</li>
          <li>• ✅ Just basic Python execution</li>
          <li>• ✅ Should work if PyScript works at all</li>
        </ul>
      </div>
      
      <div data-testid="minimal-container">
        {/* Python output will appear here */}
      </div>
      
      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Output:</h3>
        <div className="text-sm font-mono bg-white p-2 rounded">
          Hello from Python!<br/>
          Testing basic operations...<br/>
          2 + 3 = 5<br/>
          Basic Python is working!
        </div>
      </div>
    </div>
  );
} 