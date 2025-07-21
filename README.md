# Pr## 📥 Download

<div align="center">

### 🚀 Ready to use? Get the latest version!

**Current Status**: Initial release is being prepared. Download options will be available soon!

| Platform | Status | How to Get |
|----------|--------|------------|
| **macOS** (Apple Silicon) | ✅ **Ready** | [Contact for early access](#-support) |
| **macOS** (Intel) | � **On request** | [Contact for build](#-support) |
| **Windows** (64-bit) | 🚧 **In development** | Coming soon |

> **Note**: This is a new project! The first official release is being prepared. If you need immediate access, please create an issue in the [Issues](../../issues) section or follow the development setup below.

### 📦 For Developers
Want to try it now? Follow the [🛠️ Development Setup](#-development-setup-for-developers) instructions below to build from source.

[🔗 **Watch Releases**](https://github.com/Chloriiin/Protrace/releases) | [📋 **Report Issues**](https://github.com/Chloriiin/Protrace/issues) | [📚 **Documentation**](#-quick-start-for-end-users)

</div> Data Visualization Desktop App

**Protrace** is a powerful desktop application for visualizing and analyzing biology experiment data. Built with Next.js, Python, and Tauri, it provides an intuitive interface for processing Excel data files and generating publication-ready plots completely offline.

## 📥 Download

<div align="center">

### 🚀 Ready to use? Download the latest version!

| Platform | Status | Download |
|----------|--------|----------|
| **macOS** (Universal) | ✅ Available | [📦 Download DMG](https://github.com/Chloriiin/Protrace/releases) |
| **Windows** (64-bit) | � Coming Soon | Check [releases page](https://github.com/Chloriiin/Protrace/releases) |

> **Note**: Currently only macOS Universal build is available. Windows support is in development.

[🔗 **View All Releases**](https://github.com/Chloriiin/Protrace/releases) | [� **Documentation**](#-quick-start-for-end-users)

</div>

---

## 🎯 Features

- **Offline Functionality**: No internet connection required - runs completely standalone
- **Excel Data Processing**: Import and process biology experiment data from Excel files
- **Interactive Sample Configuration**: Easy-to-use interface for setting up sample wells and backgrounds
- **Publication-Ready Plots**: Generate high-quality plots with customizable settings
- **Multiple Export Formats**: Export plots as PNG, SVG, PDF, or JPEG
- **Cross-Platform**: Available for macOS and Windows
- **Embedded Python Backend**: All scientific computing libraries bundled within the app

## 🧬 Use Cases

Perfect for researchers working with:
- Protein assays and quantification
- Spectrophotometer data (A₃₅₀ readings)
- Multi-well plate experiments
- Time-series biology data
- Any Excel-based experimental data requiring visualization

## 🚀 Quick Start (For End Users)

### Getting the App
**Option 1: Wait for Official Release** (Recommended for most users)
- ⭐ **Star this repository** to get notified when the first release is available
- 📧 **Watch releases** to be notified immediately when binaries are ready

**Option 2: Request Early Access**
- Create an [Issue](../../issues) requesting access for your platform (macOS Intel/Apple Silicon)
- We'll provide you with a download link for testing

**Option 3: Build from Source** (For developers)
- Follow the [🛠️ Development Setup](#-development-setup-for-developers) section below
- Requires Node.js, Rust, and Python development environment

### Using the App
1. **Upload Data**: Click "Choose File" and select your Excel file (header should be on row 31)
2. **Configure Samples**: Set up your sample names, wells, and background wells
3. **Generate Plot**: Customize plot settings and click "Generate Plot"
4. **Export**: Download your plot in your preferred format

## 🛠️ Development Setup (For Developers)

### Prerequisites

Before you begin, ensure you have the following installed on your system:

#### Required Software
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Python** (3.10+) with conda/miniconda - [Download here](https://docs.conda.io/en/latest/miniconda.html)
- **Git** - [Download here](https://git-scm.com/)

#### Platform-Specific Requirements

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`
- macOS 10.15+ for building

**Windows:**
- Microsoft Visual Studio C++ Build Tools
- Windows 10+ for building

### Clone and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Chloriiin/Protrace.git
   cd Protrace
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python environment:**
   ```bash
   # Create conda environment with required packages
   conda create -n CapsidQuantify-env python=3.10
   conda activate CapsidQuantify-env
   
   # Install Python dependencies
   conda install pandas numpy matplotlib flask flask-cors openpyxl
   pip install pyinstaller
   ```

4. **Install Rust and Tauri CLI:**
   ```bash
   # Install Rust (if not already installed)
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   
   # Install Tauri CLI
   cargo install tauri-cli
   ```

## 🔨 Building the Application

### Development Mode

Run the application in development mode for testing:

```bash
# Start the development server
npm run tauri:dev
```

This will:
- Start the Next.js development server
- Launch the Tauri development window
- Enable hot reloading for both frontend and backend changes

### Production Build

Build the complete desktop application:

#### Option 1: Using the Build Script (Recommended)
```bash
# Make the build script executable
chmod +x build-app.sh

# Run the complete build process
./build-app.sh
```

#### Option 2: Manual Build Steps
```bash
# Step 1: Build Python backend
conda run -n CapsidQuantify-env pyinstaller protrace-backend.spec

# Step 2: Copy backend to Tauri
cp dist/protrace-backend src-tauri/binaries/protrace-backend-aarch64-apple-darwin

# Step 3: Build frontend
npm run build

# Step 4: Build Tauri app
npm run tauri:build
```

### Build Outputs

After a successful build, you'll find:

**macOS:**
- **App Bundle**: `src-tauri/target/release/bundle/macos/protrace.app`
- **DMG Installer**: `src-tauri/target/release/bundle/dmg/protrace_x.x.x_aarch64.dmg`

**Windows:**
- **Executable**: `src-tauri/target/release/bundle/msi/protrace_x.x.x_x64-setup.msi`
- **Portable**: `src-tauri/target/release/protrace.exe`

## 📁 Project Structure

```
Protrace/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx               # App layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── FileUpload.tsx           # File upload component
│   ├── SampleForm.tsx           # Sample configuration
│   ├── PlotGeneration.tsx       # Plot generation interface
│   └── ...                     # Other UI components
├── src/                         # Python source modules
│   ├── Sample.py                # Sample data handling
│   ├── Preprocessing.py         # Data preprocessing
│   └── ProtPlotting.py          # Plot generation
├── api/                         # Python backend API
│   └── index.py                 # Flask server
├── src-tauri/                   # Tauri (Rust) backend
│   ├── src/main.rs              # Main Rust application
│   ├── tauri.conf.json          # Tauri configuration
│   └── Cargo.toml               # Rust dependencies
├── protrace-backend.spec        # PyInstaller configuration
├── build-app.sh                 # Automated build script
└── package.json                 # Node.js dependencies
```

## 🔧 Configuration

### Python Environment
The app requires the `CapsidQuantify-env` conda environment with specific packages. The environment is automatically used during the build process.

### Tauri Configuration
Key settings in `src-tauri/tauri.conf.json`:
- Bundle identifier: `com.protrace.desktop`
- Window size: 1200x800
- Resources: Embedded Python backend

### PyInstaller Configuration
The `protrace-backend.spec` file configures:
- Hidden imports for custom modules
- Data files and dependencies
- Output executable settings

## 🧪 Testing

### Development Testing
```bash
# Run frontend tests
npm test

# Test Python backend separately
conda activate CapsidQuantify-env
python api/index.py
```

### Production Testing
```bash
# Test the built application
open src-tauri/target/release/bundle/macos/protrace.app

# Or on Windows
src-tauri/target/release/bundle/msi/protrace_x.x.x_x64-setup.msi
```

## 🐛 Troubleshooting

### Common Issues

**Build fails with "conda not found":**
```bash
# Make sure conda is in your PATH
export PATH="$HOME/miniconda3/bin:$PATH"
# Or source your conda initialization
source ~/.bashrc  # or ~/.zshrc
```

**Rust/Cargo not found:**
```bash
# Source the Rust environment
source ~/.cargo/env
```

**Python backend not starting:**
- Verify the `CapsidQuantify-env` environment exists
- Check that all Python dependencies are installed
- Ensure PyInstaller built successfully

**Permission denied on macOS:**
```bash
# Give execution permission to the built app
chmod +x src-tauri/target/release/bundle/macos/protrace.app/Contents/MacOS/protrace
```

### Debug Mode

Enable debug logging by modifying `src-tauri/src/main.rs`:
```rust
// Add debug prints in the start_python_backend function
println!("Debug: Attempting to start backend at: {:?}", backend_path);
```

## 📦 Distribution

### Creating Releases (For Maintainers)

To create a new release with binaries:

1. **Build the application:**
   ```bash
   ./build-app.sh
   ```

2. **Create and push a git tag:**
   ```bash
   git tag -a v0.1.0 -m "Release version 0.1.0 - Initial release with fixed export functionality"
   git push origin v0.1.0
   ```

3. **Create GitHub Release:**
   - Go to [GitHub Releases](../../releases)
   - Click "Create a new release"
   - Select the tag you just created
   - Add release notes describing new features and fixes
   - Upload the built binaries:
     - `src-tauri/target/release/bundle/dmg/protrace_0.1.0_aarch64.dmg` (macOS Apple Silicon)
     - `src-tauri/target/release/bundle/macos/protrace.app` (macOS App Bundle)

4. **Update README download links:**
   Once the release is created, the download links will automatically work:
   - `https://github.com/Chloriiin/Protrace/releases/latest/download/protrace_0.1.0_aarch64.dmg`

### Code Signing (macOS)
For distribution outside the Mac App Store:
```bash
# Sign the application
codesign --sign "Developer ID Application: Your Name" --verbose src-tauri/target/release/bundle/macos/protrace.app

# Create a signed DMG
codesign --sign "Developer ID Application: Your Name" --verbose src-tauri/target/release/bundle/dmg/protrace_x.x.x_aarch64.dmg
```

### Windows Signing
For Windows distribution, configure code signing in `src-tauri/tauri.conf.json`:
```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
        "digestAlgorithm": "sha256"
      }
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/React best practices for frontend code
- Use Python PEP 8 style for backend code
- Test both development and production builds before submitting
- Update documentation for any new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with:
   - Your operating system and version
   - Node.js, Python, and Rust versions
   - Complete error messages
   - Steps to reproduce the problem

## 🔮 Roadmap

- [x] macOS desktop application (Apple Silicon build)
- [x] Export functionality fix for desktop environment (plots + sample configs)
- [x] Updated window title with version branding
- [ ] **🎯 First official release (v0.1.0)**
- [ ] Windows build automation and release
- [ ] Intel Mac builds for older hardware
- [ ] GitHub Actions for automated builds and releases
- [ ] Auto-updater integration
- [ ] Additional plot types and customization options
- [ ] Batch processing capabilities
- [ ] Plugin system for custom data processors
- [ ] Cloud sync for settings and templates

---

**Happy analyzing! 🧬📊**