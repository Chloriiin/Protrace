// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::path::PathBuf;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get the resource path for the backend binary
            let resource_path = app.handle().path().resource_dir()
                .expect("Failed to get resource dir")
                .join("protrace-backend");

            // Spawn the backend process
            #[cfg(target_os = "windows")]
            let mut _child = Command::new(resource_path.with_extension("exe"))
                .spawn()
                .expect("Failed to start backend (Windows)");
            #[cfg(not(target_os = "windows"))]
            let mut _child = Command::new(resource_path)
                .spawn()
                .expect("Failed to start backend (Unix)");
            // Optionally: store _child in app state for later cleanup
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
