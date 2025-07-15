# Python Backend for Protrace

This is a Flask backend that handles plot generation since PyScript doesn't work in the current environment.

## Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## Endpoints

- `GET /health` - Health check
- `GET /test-packages` - Test if all packages are working
- `POST /generate-plot` - Generate plot from Excel data and configuration

## Usage

The frontend will send POST requests to `/generate-plot` with:
- `fileData`: Base64 encoded Excel file
- `samplesConfig`: Array of sample configurations
- `plotSettings`: Plot configuration (font, width, title, etc.)

The backend responds with:
- `success`: Boolean indicating success
- `imageUrl`: Base64 data URL of the generated plot
- `message` or `error`: Status message 