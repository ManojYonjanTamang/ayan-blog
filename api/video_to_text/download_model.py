#!/usr/bin/env python3
"""
Download Vosk model for speech recognition
"""

import os
import sys
import requests
import zipfile
from tqdm import tqdm

def download_file(url, filename):
    """Download a file with progress bar"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024
    progress_bar = tqdm(total=total_size, unit='iB', unit_scale=True)
    
    with open(filename, 'wb') as f:
        for data in response.iter_content(block_size):
            progress_bar.update(len(data))
            f.write(data)
    progress_bar.close()

def main():
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    model_url = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
    model_zip = os.path.join(script_dir, "vosk-model-small-en-us-0.15.zip")
    model_dir = os.path.join(script_dir, "vosk-model-small-en-us-0.15")
    
    # Check if model already exists
    if os.path.exists(model_dir):
        print(f"Model already exists at {model_dir}")
        return
    
    print(f"Downloading Vosk model from {model_url}")
    download_file(model_url, model_zip)
    
    print("Extracting model...")
    with zipfile.ZipFile(model_zip, 'r') as zip_ref:
        zip_ref.extractall(script_dir)
    
    # Clean up zip file
    os.remove(model_zip)
    print(f"Model downloaded and extracted to {model_dir}")

if __name__ == "__main__":
    main() 