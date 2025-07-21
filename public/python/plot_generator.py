import io
import base64
import json
import pandas as pd
import numpy as np
from js import document, console, window
from pyodide.ffi import create_proxy
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
import sys
import os

# Import our plotting modules directly from the current directory
from Sample import Sample
from Preprocessing import pre_process_df
from ProtPlotting import plot_stdized_samples

def create_samples_from_config(file_data, samples_config):
    """Create Sample objects from uploaded Excel data and sample configuration."""
    try:
        # Parse the Excel file
        df = pd.read_excel(io.BytesIO(file_data))
        console.log(f"Loaded Excel file with shape: {df.shape}")
        
        # Preprocess the data (default 361 reads)
        processed_df = pre_process_df(df, reads_num=361)
        console.log(f"Processed data shape: {processed_df.shape}")
        
        # Create Sample objects
        samples = []
        for sample_config in samples_config:
            # Create Sample object (parameter order: dataframe, sample_name, background_well, sample_wells)
            sample = Sample(
                dataframe=processed_df,
                sample_name=sample_config['sampleName'],
                background_well=sample_config['backgroundWell'],
                sample_wells=sample_config['sampleWells']
            )
            samples.append(sample)
        
        return samples
    
    except Exception as e:
        console.error(f"Error creating samples: {str(e)}")
        raise

def generate_plot(file_data, samples_config, plot_settings):
    """Generate the plot using the existing ProtPlotting functions."""
    try:
        console.log("Starting plot generation...")
        
        # Create Sample objects
        samples = create_samples_from_config(file_data, samples_config)
        console.log(f"Created {len(samples)} samples")
        
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
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        
        # Convert to base64 for display
        img_data = base64.b64encode(buf.read()).decode('utf-8')
        img_url = f"data:image/png;base64,{img_data}"
        
        plt.close()  # Clean up
        
        console.log("Plot generation completed successfully")
        return img_url
        
    except Exception as e:
        console.error(f"Error generating plot: {str(e)}")
        raise

# Create a proxy function for JavaScript to call
def create_plot_generator():
    """Create a plot generator function that can be called from JavaScript."""
    def plot_generator_proxy(file_data_b64, samples_config_json, plot_settings_json):
        try:
            # Decode base64 file data
            file_data = base64.b64decode(file_data_b64)
            
            # Parse JSON configurations
            samples_config = json.loads(samples_config_json)
            plot_settings = json.loads(plot_settings_json)
            
            # Generate the plot
            img_url = generate_plot(file_data, samples_config, plot_settings)
            
            # Return the image URL to JavaScript
            return img_url
            
        except Exception as e:
            console.error(f"Plot generation error: {str(e)}")
            return None
    
    return create_proxy(plot_generator_proxy)

# Make the plot generator available to JavaScript
window.generatePlot = create_plot_generator()
console.log("Plot generator ready!") 