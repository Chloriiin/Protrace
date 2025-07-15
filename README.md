# Protrace - Protein Assembly Assay Visualization

A Next.js webapp for visualizing protein assembly assay experiment results. This application helps biology researchers by providing an intuitive interface to upload raw data from protein AA machines and generate beautiful visualizations.

## Features

- 📊 **Interactive File Upload**: Drag & drop Excel files (.xlsx) with automatic validation
- 🔬 **Sample Configuration**: GUI table for selecting and configuring samples
- 📤 **Sample Import/Export**: Save and load sample configurations as JSON files
- 📈 **Advanced Plotting**: Customizable plots with size, font, and color options
- 💾 **Export Options**: Save plots as PNG, SVG, or PDF
- 🔄 **Multi-step Workflow**: Guided process from data upload to final visualization

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: PyScript (runs Python in the browser)
- **Python Libraries**: pandas, numpy, matplotlib
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Chloriiin/protrace.git
cd protrace
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development

The application structure:
- `app/` - Next.js app router pages and layout
- `components/` - React components
- `public/python/` - Python modules for PyScript
- `styles/` - Global styles and Tailwind configuration

### Deployment

This project is configured for GitHub Pages deployment:

1. Build the application:
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

The app will be available at `https://chloriiin.github.io/protrace/`

## Usage

1. **Upload Data**: Drag and drop or select an Excel file containing protein assembly data
2. **Configure Samples**: Use the interactive table to select background wells and sample wells
3. **Generate Plot**: Create initial visualization with default settings
4. **Customize**: Adjust plot size, fonts, colors, and titles
5. **Export**: Save your final plot in preferred format
6. **Restart**: Begin a new analysis

## Python Integration

The application uses PyScript to run the original Python analysis code in the browser:
- `preprocessing.py` - Data preprocessing and validation
- `sample.py` - Sample class for data management
- `protplotting.py` - Advanced plotting functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Sample Import/Export

The application includes comprehensive import/export functionality for sample configurations:

### Export Features:
- **Save & Export** button downloads sample configurations as JSON files
- **Automatic timestamping** with format: `protrace-samples-YYYY-MM-DDTHH-MM-SS.json`
- **Complete metadata** including version, export date, and plate type
- **Human-readable format** for easy sharing and archiving

### Import Features:
- **Import Samples** button accepts JSON files from previous exports
- **Validation system** ensures file format and well ID correctness
- **Conflict handling** with user confirmation for existing samples
- **Visual feedback** with success/error messages
- **Automatic reconstruction** of well plate selections

### File Format:
```json
{
  "version": "1.0.0",
  "exportDate": "2025-01-02T10:30:45.123Z",
  "plateType": "96-well",
  "applicationName": "Protrace",
  "samples": [
    {
      "id": "unique-sample-id",
      "sampleName": "Sample_A",
      "backgroundWell": "B2",
      "sampleWells": ["B3", "B4"]
    }
  ]
}
```

## Workflow

The complete workflow follows these steps:
1. Upload raw Excel data from protein AA machine
2. Select and configure samples using the GUI table
3. **[Optional]** Save sample configuration for future use
4. Generate plots using the existing Python visualization code
5. Customize plot appearance (size, fonts, colors)
6. Export final visualization
7. Return to step 1 for new analysis

## Support

For issues or questions, please create an issue in the GitHub repository. 