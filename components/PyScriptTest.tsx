'use client';

import { useState, useEffect } from 'react';

export default function PyScriptTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  useEffect(() => {
    const runTests = async () => {
      try {
        addResult('Starting PyScript tests...');
        
        // Test 1: Load PyScript core
        setCurrentTest('Loading PyScript core...');
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://pyscript.net/releases/2024.1.1/core.css';
        document.head.appendChild(cssLink);
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://pyscript.net/releases/2024.1.1/core.js';
        document.head.appendChild(script);
        
        script.onload = () => {
          addResult('✅ PyScript core loaded successfully');
          setCurrentTest('Testing basic Python...');
          
          // Test 2: Basic Python without packages
          setTimeout(() => {
            const basicTest = document.createElement('py-script');
            basicTest.innerHTML = `
from js import console
console.log("✅ Basic Python execution works!")
            `;
            basicTest.style.display = 'none';
            document.body.appendChild(basicTest);
            
            setTimeout(() => {
              addResult('✅ Basic Python works');
              setCurrentTest('Testing package installation...');
              
              // Test 3: Package installation
              const packageTest = document.createElement('py-script');
              packageTest.innerHTML = `
import micropip
from js import console

async def test_packages():
    try:
        console.log("🔄 Installing pandas...")
        await micropip.install("pandas")
        console.log("✅ pandas installed successfully")
        
        console.log("🔄 Testing pandas import...")
        import pandas as pd
        console.log("✅ pandas imported successfully")
        
        console.log("🔄 Installing numpy...")
        await micropip.install("numpy")
        console.log("✅ numpy installed successfully")
        
        console.log("🔄 Testing numpy import...")
        import numpy as np
        console.log("✅ numpy imported successfully")
        
        console.log("🔄 Installing matplotlib...")
        await micropip.install("matplotlib")
        console.log("✅ matplotlib installed successfully")
        
        console.log("🔄 Testing matplotlib import...")
        import matplotlib.pyplot as plt
        console.log("✅ matplotlib imported successfully")
        
        console.log("🎉 All packages working!")
        
    except Exception as e:
        console.error(f"❌ Package test failed: {str(e)}")

test_packages()
              `;
              packageTest.style.display = 'none';
              document.body.appendChild(packageTest);
              
            }, 2000);
          }, 2000);
        };
        
        script.onerror = (error) => {
          addResult('❌ Failed to load PyScript core');
          console.error('PyScript load error:', error);
        };
        
      } catch (error) {
        addResult(`❌ Test failed: ${error}`);
      }
    };

    runTests();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">PyScript Debug Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Test:</h2>
        <p className="text-blue-600">{currentTest || 'Initializing...'}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Check the browser console for more detailed logs.</p>
        <p>This test will help identify where the package installation is failing.</p>
      </div>
    </div>
  );
} 