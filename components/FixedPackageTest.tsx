'use client';

import { useState, useEffect } from 'react';

export default function FixedPackageTest() {
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
        addLog('Starting PyScript package test');
        
        // Load PyScript
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
        document.head.appendChild(cssLink);
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
        document.head.appendChild(script);
        
        script.onload = () => {
          addLog('PyScript core loaded');
          setStatus('Loading micropip...');
          
          // Wait for PyScript to be ready, then load micropip from JavaScript
          setTimeout(() => {
            addLog('Loading micropip from JavaScript...');
            
            // Load micropip first using JavaScript
            const loadMicropip = document.createElement('py-script');
            loadMicropip.innerHTML = `
from js import console
console.log("Python is working")

# First, let's check what's available
try:
    import sys
    console.log("Python version: " + sys.version)
except Exception as e:
    console.error("Error checking Python version: " + str(e))

# Check if micropip is available
try:
    import micropip
    console.log("SUCCESS: micropip is available!")
    
    # Now try to install pandas
    async def install_pandas():
        try:
            console.log("Installing pandas...")
            await micropip.install("pandas")
            console.log("SUCCESS: pandas installed")
            
            import pandas as pd
            console.log("SUCCESS: pandas imported")
            
            # Test basic functionality
            df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
            console.log("SUCCESS: DataFrame created with shape: " + str(df.shape))
            
            # Test Excel reading capability
            console.log("Testing pandas Excel capabilities...")
            
            # Install openpyxl for Excel support
            await micropip.install("openpyxl")
            console.log("SUCCESS: openpyxl installed")
            
            console.log("All tests passed!")
            
        except Exception as e:
            console.error("Package installation failed: " + str(e))
    
    install_pandas()
    
except ImportError as e:
    console.error("micropip not available: " + str(e))
    console.log("Trying to load micropip using different method...")
    
    # Try alternative approach - this shouldn't work but let's test
    try:
        from pyodide import loadPackage
        console.log("Found pyodide.loadPackage, trying to load micropip...")
        await loadPackage("micropip")
        console.log("micropip loaded via pyodide.loadPackage")
        
        import micropip
        console.log("SUCCESS: micropip now available")
        
    except Exception as e2:
        console.error("Alternative method failed: " + str(e2))

except Exception as e:
    console.error("Unexpected error: " + str(e))
            `;
            loadMicropip.style.display = 'none';
            document.body.appendChild(loadMicropip);
            
            setStatus('Testing package installation...');
            
          }, 3000);
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
      <h1 className="text-2xl font-bold mb-4">Fixed Package Test</h1>
      
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
        <p>This test attempts to properly load micropip before using it.</p>
        <p>Check the browser console for detailed error messages.</p>
      </div>
    </div>
  );
} 