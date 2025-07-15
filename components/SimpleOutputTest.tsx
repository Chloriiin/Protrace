'use client';

import { useState, useEffect } from 'react';

export default function SimpleOutputTest() {
  const [status, setStatus] = useState<string>('Starting...');

  useEffect(() => {
    const runTest = async () => {
      try {
        setStatus('Cleaning up previous PyScript...');
        
        // Clean up existing elements
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
          
          // Create py-config
          const pyConfig = document.createElement('py-config');
          pyConfig.innerHTML = `
packages = ["pandas"]
          `;
          document.head.appendChild(pyConfig);
          
          // Load PyScript
          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
          document.head.appendChild(script);
          
          script.onload = () => {
            setStatus('PyScript loaded, waiting for packages...');
            
            // Wait for packages to install
            setTimeout(() => {
              setStatus('Creating Python test...');
              
              // Create output div for Python results
              const outputDiv = document.createElement('div');
              outputDiv.id = 'python-output';
              outputDiv.style.padding = '10px';
              outputDiv.style.background = '#f0f0f0';
              outputDiv.style.border = '1px solid #ccc';
              outputDiv.style.marginTop = '20px';
              outputDiv.innerHTML = '<h3>Python Output:</h3>';
              
              // Find the container and add output div
              const container = document.querySelector('[data-testid="output-container"]');
              if (container) {
                container.appendChild(outputDiv);
              }
              
              // Create Python script that writes directly to the page
              const testScript = document.createElement('py-script');
              testScript.setAttribute('output', 'python-output');
              testScript.innerHTML = `
print("=== PyScript Test Results ===")
print("Step 1: Python is executing ✅")

try:
    print("Step 2: Attempting to import pandas...")
    import pandas as pd
    print("Step 2: pandas imported successfully! 🎉")
    
    print("Step 3: Creating DataFrame...")
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    print(f"Step 3: DataFrame created with shape {df.shape} 🎉")
    
    print("Step 4: Testing DataFrame operations...")
    result = df.sum()
    print("Step 4: DataFrame operations work! 🎉")
    
    print("🎉 ALL TESTS PASSED! PyScript + pandas working correctly!")
    
except ImportError as e:
    print(f"❌ ImportError: {e}")
    print("❌ This means pandas is not available")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    print(f"❌ Error type: {type(e).__name__}")

print("=== Test Complete ===")
              `;
              
              document.body.appendChild(testScript);
              
              setStatus('Python test executed - check output below');
              
            }, 12000); // Wait 12 seconds for packages
          };
          
          script.onerror = () => {
            setStatus('Failed to load PyScript');
          };
          
        }, 1000);
        
      } catch (error) {
        setStatus(`Error: ${error}`);
      }
    };

    runTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Output Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600 font-mono">{status}</p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">This test:</h3>
        <ul className="text-sm space-y-1">
          <li>• Uses PyScript's built-in output system</li>
          <li>• Writes results directly to the page below</li>
          <li>• No JavaScript callbacks needed</li>
          <li>• Should show Python output immediately</li>
        </ul>
      </div>
      
      <div data-testid="output-container">
        {/* Python output will be inserted here */}
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <p className="text-sm">
          Wait 15 seconds for the test to complete. Python output should appear below.
          If no output appears, check the browser console for errors.
        </p>
      </div>
    </div>
  );
} 