'use client';

import { useState, useEffect } from 'react';

export default function CleanTest() {
  const [status, setStatus] = useState<string>('Starting...');
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const runCleanTest = async () => {
      try {
        setStatus('Cleaning previous PyScript instances...');
        
        // Clean up any existing PyScript elements
        const existingPyConfigs = document.querySelectorAll('py-config');
        existingPyConfigs.forEach(el => el.remove());
        
        const existingPyScripts = document.querySelectorAll('py-script');
        existingPyScripts.forEach(el => el.remove());
        
        const existingPyScriptLinks = document.querySelectorAll('link[href*="pyscript"]');
        existingPyScriptLinks.forEach(el => el.remove());
        
        const existingPyScriptScripts = document.querySelectorAll('script[src*="pyscript"]');
        existingPyScriptScripts.forEach(el => el.remove());
        
        // Clear any existing results
        delete (window as any).captureResult;
        
        setStatus('Initializing clean PyScript...');
        
        // Create a global callback to capture Python results
        (window as any).captureResult = (message: string) => {
          setResults(prev => [...prev, message]);
          console.log('Python result:', message);
        };
        
        // Wait a bit for cleanup
        setTimeout(() => {
          setStatus('Loading PyScript CSS...');
          
          // Load PyScript CSS
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
          document.head.appendChild(cssLink);
          
          // Create a single py-config for pandas only
          const pyConfig = document.createElement('py-config');
          pyConfig.innerHTML = `
packages = ["pandas"]
          `;
          document.head.appendChild(pyConfig);
          
          setStatus('Loading PyScript core...');
          
          // Load PyScript
          const script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
          document.head.appendChild(script);
          
          script.onload = () => {
            setStatus('PyScript loaded, waiting for packages...');
            
            // Wait for packages to install
            setTimeout(() => {
              setStatus('Executing Python test...');
              
              // Create a simple test
              const testScript = document.createElement('py-script');
              testScript.innerHTML = `
from js import window

# Test 1: Basic execution
window.captureResult("Step 1: ✅ Python is executing")

# Test 2: Try pandas import
try:
    import pandas as pd
    window.captureResult("Step 2: 🎉 pandas imported successfully!")
    
    # Test 3: Create DataFrame
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    window.captureResult(f"Step 3: 🎉 DataFrame created with shape {df.shape}")
    
    # Test 4: Basic operations
    result = df.sum()
    window.captureResult("Step 4: 🎉 DataFrame operations work!")
    
    window.captureResult("🎉 ALL TESTS PASSED! PyScript + pandas working correctly!")
    
except ImportError as e:
    window.captureResult(f"❌ ImportError: {str(e)}")
    window.captureResult("❌ This means pandas is not available")
except Exception as e:
    window.captureResult(f"❌ Unexpected error: {str(e)}")
    window.captureResult(f"❌ Error type: {type(e).__name__}")
              `;
              testScript.style.display = 'none';
              document.body.appendChild(testScript);
              
              // Final status update
              setTimeout(() => {
                setStatus('Test execution completed');
              }, 3000);
              
            }, 10000); // Wait 10 seconds for package installation
          };
          
          script.onerror = () => {
            setStatus('❌ Failed to load PyScript');
          };
          
        }, 1000); // Wait 1 second for cleanup
        
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      }
    };

    runCleanTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Clean PyScript Test</h1>
      
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
      
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">Clean Test Features:</h3>
        <ul className="text-sm space-y-1">
          <li>• ✅ Cleans up existing py-config elements</li>
          <li>• ✅ Uses single py-config (avoids "too many" warning)</li>
          <li>• ✅ Direct result reporting to UI</li>
          <li>• ✅ Step-by-step execution tracking</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <p className="text-sm">
          <strong>Important:</strong> Only visit this test page in a new browser tab or after refreshing 
          to avoid conflicts with other PyScript tests.
        </p>
      </div>
    </div>
  );
} 