'use client';

import { useState, useEffect } from 'react';

export default function PyConfigTest() {
  const [status, setStatus] = useState<string>('Loading...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const testPackages = async () => {
      try {
        setStatus('Loading PyScript...');
        addLog('Starting PyScript with py-config approach');
        
        // Load PyScript CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
        document.head.appendChild(cssLink);
        
        // Create py-config FIRST, before loading PyScript
        const pyConfig = document.createElement('py-config');
        pyConfig.innerHTML = `
packages = ["pandas", "numpy", "matplotlib", "openpyxl"]
        `;
        document.head.appendChild(pyConfig);
        addLog('py-config created with packages: pandas, numpy, matplotlib, openpyxl');
        
        // Load PyScript JS
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
        document.head.appendChild(script);
        
        script.onload = () => {
          addLog('PyScript core loaded');
          setStatus('Waiting for packages to install...');
          
          // Wait longer for packages to install via py-config
          setTimeout(() => {
            addLog('Testing pre-installed packages...');
            
            const testScript = document.createElement('py-script');
            testScript.innerHTML = `
from js import console
console.log("Python is working")

# Test pandas
try:
    import pandas as pd
    console.log("SUCCESS: pandas imported directly (no micropip needed)")
    
    # Test basic functionality
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    console.log("SUCCESS: DataFrame created with shape: " + str(df.shape))
    
    # Test Excel reading support
    try:
        import openpyxl
        console.log("SUCCESS: openpyxl available for Excel support")
    except ImportError:
        console.log("WARNING: openpyxl not available")
    
    console.log("SUCCESS: pandas test passed!")
    
except ImportError as e:
    console.error("FAILED: pandas not available: " + str(e))

# Test numpy
try:
    import numpy as np
    console.log("SUCCESS: numpy imported")
    
    arr = np.array([1, 2, 3, 4, 5])
    console.log("SUCCESS: numpy array created: " + str(arr))
    
except ImportError as e:
    console.error("FAILED: numpy not available: " + str(e))

# Test matplotlib
try:
    import matplotlib.pyplot as plt
    console.log("SUCCESS: matplotlib imported")
    
    # Create a simple plot (won't display but tests the import)
    fig, ax = plt.subplots()
    ax.plot([1, 2, 3, 4], [1, 4, 2, 3])
    console.log("SUCCESS: matplotlib plot created")
    
except ImportError as e:
    console.error("FAILED: matplotlib not available: " + str(e))

console.log("Package testing complete!")
            `;
            testScript.style.display = 'none';
            document.body.appendChild(testScript);
            
            setStatus('Testing packages...');
            
          }, 8000); // Wait 8 seconds for packages to install
        };
        
        script.onerror = (error) => {
          addLog('Failed to load PyScript');
          setStatus('Failed to load PyScript');
        };
        
      } catch (error) {
        addLog(`Error: ${error}`);
        setStatus('Error occurred');
      }
    };

    testPackages();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">PyConfig Package Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600">{status}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Logs:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono">
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This test uses py-config to pre-load packages before PyScript starts.</p>
        <p>This is the recommended approach and should avoid micropip issues.</p>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
} 