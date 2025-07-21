// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child, Stdio};
use tauri::{Manager, State, AppHandle};
use std::sync::Mutex;
use std::fs;
use base64::{Engine as _, engine::general_purpose};

struct BackendState {
    child: Mutex<Option<Child>>,
}

#[tauri::command]
fn start_python_backend(state: State<BackendState>, app_handle: AppHandle) -> Result<String, String> {
    // First, let's try to find the backend binary by checking different possible paths
    let possible_paths = [
        "protrace-backend",
        "dist/protrace-backend", 
        "_up_/dist/protrace-backend",
        "../dist/protrace-backend"
    ];
    
    let mut backend_path = None;
    
    for path in &possible_paths {
        if let Some(resource_path) = app_handle.path_resolver().resolve_resource(path) {
            println!("Found resource at: {:?}", resource_path);
            if resource_path.exists() {
                backend_path = Some(resource_path);
                break;
            }
        }
    }
    
    let backend_path = backend_path.ok_or("Failed to find backend resource in any expected location")?;

    let mut child_guard = state.child.lock().unwrap();
    
    if child_guard.is_some() {
        return Ok("Backend already running".to_string());
    }

    #[cfg(target_os = "windows")]
    let backend_path = backend_path.with_extension("exe");

    println!("Attempting to start backend at: {:?}", backend_path);

    let child = Command::new(&backend_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start Python backend: {}", e))?;

    *child_guard = Some(child);
    
    Ok("Python backend started successfully".to_string())
}

#[tauri::command]
fn stop_python_backend(state: State<BackendState>) -> Result<String, String> {
    let mut child_guard = state.child.lock().unwrap();
    
    if let Some(mut child) = child_guard.take() {
        child.kill().map_err(|e| format!("Failed to stop backend: {}", e))?;
        Ok("Backend stopped".to_string())
    } else {
        Ok("Backend was not running".to_string())
    }
}

#[tauri::command]
fn save_image_file(path: String, data: String) -> Result<String, String> {
    // Decode base64 data
    let decoded = general_purpose::STANDARD
        .decode(&data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    // Write to file
    fs::write(&path, decoded)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(format!("File saved successfully to: {}", path))
}

fn main() {
    tauri::Builder::default()
        .manage(BackendState {
            child: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![start_python_backend, stop_python_backend, save_image_file])
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_millis(2000));
                // Auto-start the Python backend when the app starts
                let state = app_handle.state::<BackendState>();
                let handle_clone = app_handle.clone();
                if let Err(e) = start_python_backend(state, handle_clone) {
                    eprintln!("Failed to start Python backend on startup: {}", e);
                }
            });
            
            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
                // Clean up backend process when window is closed
                let state = event.window().state::<BackendState>();
                let _ = stop_python_backend(state);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
