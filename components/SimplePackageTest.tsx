'use client';

import { useState, useEffect } from 'react';

export default function SimplePackageTest() {
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
          setStatus('Testing packages...');
          
          // Simple test - just try to import pandas directly
          setTimeout(() => {
            const testScript = document.createElement('py-script');
            testScript.innerHTML = `
try:
    from js import console
    console.log("Python is working")
    
    # Try to import pandas directly (should fail)
    try:
        import pandas as pd
        console.log("ERROR: pandas imported without installation!")
    except ImportError as e:
        console.log("Expected: pandas not available - " + str(e))
    
    # Now try to install pandas
    import micropip
    
    async def install_and_test():
        try:
            console.log("Installing pandas...")
            await micropip.install("pandas")
            console.log("Pandas installed successfully")
            
            import pandas as pd
            console.log("SUCCESS: pandas imported after installation")
            
            # Test basic pandas functionality
            df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
            console.log("SUCCESS: DataFrame created - shape: " + str(df.shape))
            
            console.log("All tests passed!")
            
        except Exception as e:
            console.error("Installation failed: " + str(e))
    
    install_and_test()
    
except Exception as e:
    console.error("Test script failed: " + str(e))
            `;
            testScript.style.display = 'none';
            document.body.appendChild(testScript);
            
          }, 2000);
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
      <h1 className="text-2xl font-bold mb-4">Simple Package Test</h1>
      
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
        <p>This test will show exactly what happens when we try to install pandas.</p>
        <p>Check the browser console for detailed error messages.</p>
      </div>
    </div>
  );
} 