from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import io
import base64
import json
import sys
import os

# Add the src directory to the path for both development and PyInstaller
if hasattr(sys, '_MEIPASS'):
    # PyInstaller bundle
    src_path = os.path.join(sys._MEIPASS, 'src')
else:
    # Development
    src_path = os.path.join(os.path.dirname(__file__), '..', 'src')

sys.path.insert(0, src_path)

# Import our plotting modules
try:
    from Sample import Sample
    from Preprocessing import pre_process_df
    from ProtPlotting import plot_stdized_samples
    print("Successfully imported plotting modules")
except ImportError as e:
    print(f"Failed to import modules: {e}")
    print(f"Python path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Files in current directory: {os.listdir('.')}")
    if os.path.exists('src'):
        print(f"Files in src directory: {os.listdir('src')}")
    raise

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Python backend is running"})

@app.route('/generate-plot', methods=['POST'])
def generate_plot():
    """Generate plot from uploaded Excel data and sample configuration"""
    try:
        # Get the request data
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract components
        file_data_b64 = data.get('fileData')
        samples_config = data.get('samplesConfig')
        plot_settings = data.get('plotSettings')
        export_format = data.get('exportFormat', 'png').lower()
        if export_format not in ['png', 'svg', 'pdf', 'jpg', 'jpeg']:
            export_format = 'png'
        
        if not all([file_data_b64, samples_config, plot_settings]):
            return jsonify({"error": "Missing required data"}), 400
        
        # Decode base64 file data
        try:
            file_data = base64.b64decode(file_data_b64)
            print(f"Successfully decoded file data: {len(file_data)} bytes")
        except Exception as e:
            print(f"Error decoding base64 data: {str(e)}")
            raise ValueError(f"Invalid base64 data: {str(e)}")
        
        # Parse the Excel file
        try:
            # As per the original script, the header is on a fixed row.
            # In Excel this is row 31, which is 0-indexed 30 for pandas.
            header_row = 30
            df = pd.read_excel(io.BytesIO(file_data), header=header_row)
            print(f"Successfully loaded Excel file with header at row {header_row + 1}.")
            print(f"Data shape: {df.shape}")
            print(f"Column names: {list(df.columns)}")

        except Exception as e:
            print(f"Error reading Excel file: {str(e)}")
            raise ValueError(f"Could not read Excel file. Please ensure it is a valid Excel file and the header is on row 31. Error: {str(e)}")

        # Preprocess the data
        try:
            processed_df = pre_process_df(df, reads_num=361)
            print(f"Processed data shape: {processed_df.shape}")
        except Exception as e:
            print(f"Error preprocessing data: {str(e)}")
            raise ValueError(f"Could not preprocess data: {str(e)}")
        
        # Create Sample objects
        samples = []
        for sample_config in samples_config:
            # Get config values, converting "empty" ones to None so that the
            # Sample class handles them correctly. An empty string for the background
            # or an empty list for sample wells should be treated as None.
            background_well = sample_config.get('backgroundWell') or None
            sample_wells = sample_config.get('sampleWells') or None

            sample = Sample(
                dataframe=processed_df,
                sample_name=sample_config['sampleName'],
                background_well=background_well,
                sample_wells=sample_wells
            )
            samples.append(sample)
        
        print(f"Created {len(samples)} samples")
        
        # Configure plot settings
        figsize = (plot_settings['width'], 5)  # Height is fixed at 5
        
        # Generate the plot
        plot_stdized_samples(
            samples,
            figsize=figsize,
            font=plot_settings['font'],
            title=plot_settings['title'],
            subtitle=plot_settings['subtitle'],
            y_label=plot_settings['yLabel']
        )
        
        # Save plot to bytes
        buf = io.BytesIO()
        plt.savefig(buf, format=export_format, dpi=150, bbox_inches='tight')
        buf.seek(0)
        
        # Convert to base64 for response
        if export_format == 'svg':
            mime = 'image/svg+xml'
        elif export_format == 'pdf':
            mime = 'application/pdf'
        elif export_format in ['jpg', 'jpeg']:
            mime = 'image/jpeg'
        else:
            mime = 'image/png'
        img_data = base64.b64encode(buf.read()).decode('utf-8')
        img_url = f"data:{mime};base64,{img_data}"
        
        plt.close()  # Clean up
        
        print("Plot generation completed successfully")
        
        return jsonify({
            "success": True,
            "imageUrl": img_url,
            "message": f"Plot generated successfully as {export_format.upper()}"
        })
        
    except Exception as e:
        print(f"Error generating plot: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/test-packages', methods=['GET'])
def test_packages():
    """Test if all required packages are available"""
    try:
        # Test pandas
        import pandas as pd
        df = pd.DataFrame({'test': [1, 2, 3]})
        
        # Test numpy
        import numpy as np
        arr = np.array([1, 2, 3])
        
        # Test matplotlib
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots()
        ax.plot([1, 2, 3], [1, 2, 3])
        plt.close()
        
        # Test openpyxl
        import openpyxl
        
        return jsonify({
            "success": True,
            "message": "All packages working correctly",
            "packages": {
                "pandas": pd.__version__,
                "numpy": np.__version__,
                "matplotlib": matplotlib.__version__,
                "openpyxl": openpyxl.__version__
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Python backend server...")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  GET  /test-packages - Test package availability")
    print("  POST /generate-plot - Generate plot from data")
    
    app.run(debug=True, host='0.0.0.0', port=5001) 