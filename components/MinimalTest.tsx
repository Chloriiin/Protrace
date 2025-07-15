'use client';

import { useState, useEffect } from 'react';

export default function MinimalTest() {
  const [status, setStatus] = useState<string>('Starting...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  useEffect(() => {
    const runMinimalTest = async () => {
      try {
        addLog('🚀 Starting minimal PyScript test');
        setStatus('Loading PyScript...');
        
        // Step 1: Load PyScript CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
        document.head.appendChild(cssLink);
        addLog('✅ PyScript CSS loaded');
        
        // Step 2: Create py-config FIRST (this is crucial)
        const pyConfig = document.createElement('py-config');
        pyConfig.innerHTML = `
packages = ["pandas"]
        `;
        document.head.appendChild(pyConfig);
        addLog('✅ py-config created for pandas');
        
        // Step 3: Load PyScript JS
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
        document.head.appendChild(script);
        
        script.onload = () => {
          addLog('✅ PyScript core loaded');
          setStatus('Waiting for pandas to install...');
          
          // Step 4: Wait for packages to install, then test
          setTimeout(() => {
            addLog('🧪 Testing pandas import...');
            setStatus('Testing pandas...');
            
            const testScript = document.createElement('py-script');
            testScript.innerHTML = `
from js import console

# Test 1: Basic Python
console.log("✅ Python is working")

# Test 2: Try to import pandas
try:
    import pandas as pd
    console.log("🎉 SUCCESS: pandas imported!")
    
    # Test 3: Create a simple DataFrame
    df = pd.DataFrame({'test': [1, 2, 3]})
    console.log("🎉 SUCCESS: DataFrame created!")
    console.log("DataFrame shape: " + str(df.shape))
    
    # Test 4: Try basic operations
    result = df.sum()
    console.log("🎉 SUCCESS: DataFrame operations work!")
    
    console.log("✅ ALL TESTS PASSED!")
    
except Exception as e:
    console.error("❌ FAILED: " + str(e))
    console.error("Error type: " + str(type(e)))
            `;
            testScript.style.display = 'none';
            document.body.appendChild(testScript);
            
            // Check for success after a delay
            setTimeout(() => {
              setStatus('Test complete - check console for results');
            }, 5000);
            
          }, 10000); // Wait 10 seconds for package installation
        };
        
        script.onerror = (error) => {
          addLog('❌ Failed to load PyScript core');
          setStatus('Failed to load PyScript');
          console.error('PyScript error:', error);
        };
        
      } catch (error) {
        addLog(`❌ Error: ${error}`);
        setStatus('Error occurred');
      }
    };

    runMinimalTest();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Minimal PyScript Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600 font-mono">{status}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Steps:</h2>
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono">
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">This test:</h3>
        <ul className="text-sm space-y-1">
          <li>• Uses py-config to pre-load pandas</li>
          <li>• Waits 10 seconds for installation</li>
          <li>• Tests pandas import and basic operations</li>
          <li>• Should work without micropip errors</li>
        </ul>
      </div>
    </div>
  );
} 