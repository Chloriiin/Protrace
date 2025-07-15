'use client';

import { useState, useEffect } from 'react';

export default function DirectTest() {
  const [status, setStatus] = useState<string>('Starting...');
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const runTest = async () => {
      setStatus('Loading PyScript...');
      
      // Create a global callback to capture Python results
      (window as any).captureResult = (message: string) => {
        setResults(prev => [...prev, message]);
        console.log('Python result:', message);
      };
      
      // Load PyScript CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
      document.head.appendChild(cssLink);
      
      // Create py-config for pandas
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
          setStatus('Testing pandas...');
          
          // Create a simple test that reports results directly
          const testScript = document.createElement('py-script');
          testScript.innerHTML = `
from js import window

# Test 1: Basic execution
window.captureResult("✅ Python is executing")

# Test 2: Try pandas import
try:
    import pandas as pd
    window.captureResult("🎉 pandas imported successfully!")
    
    # Test 3: Create DataFrame
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    window.captureResult(f"🎉 DataFrame created: {df.shape}")
    
    # Test 4: Basic operations
    result = df.sum()
    window.captureResult("🎉 DataFrame operations work!")
    
    window.captureResult("✅ ALL TESTS PASSED!")
    
except ImportError as e:
    window.captureResult(f"❌ ImportError: {str(e)}")
except Exception as e:
    window.captureResult(f"❌ Error: {str(e)}")
    window.captureResult(f"❌ Error type: {type(e).__name__}")
          `;
          testScript.style.display = 'none';
          document.body.appendChild(testScript);
          
          // Check if we got results after a delay
          setTimeout(() => {
            setStatus('Test completed - check results below');
          }, 5000);
          
        }, 8000); // Wait 8 seconds for package installation
      };
      
      script.onerror = () => {
        setStatus('Failed to load PyScript');
      };
    };

    runTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Direct Python Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600 font-mono">{status}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Python Results:</h2>
        {results.length === 0 ? (
          <p className="text-gray-500 italic">Waiting for Python results...</p>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Important:</h3>
        <p className="text-sm">
          This test uses a direct callback to capture Python results. 
          If you see "Waiting for Python results..." for more than 10 seconds, 
          check the browser console for error messages.
        </p>
      </div>
    </div>
  );
} 