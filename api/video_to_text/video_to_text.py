#!/usr/bin/env python3
"""
YouTube Video to Text Transcription Tool

This script downloads audio from a YouTube video and transcribes it using Vosk.
The transcription is saved to a text file and displayed in the console.
The script also provides an improved version using AI-powered text enhancement.
"""

# Standard library imports
import os
import sys
import json
import wave
import re
import argparse

# Third-party imports
from pytubefix import YouTube
from pydub import AudioSegment
from vosk import Model, KaldiRecognizer
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

def download_audio(url: str) -> tuple:
    """
    Download audio from a YouTube video.
    
    Args:
        url (str): YouTube video URL
        
    Returns:
        tuple: (Path to the downloaded audio file, Video title)
        
    Raises:
        SystemExit: If download fails
    """
    try:
        # Create YouTube object
        yt = YouTube(url)
        print(f"\nTitle: {yt.title}")
        print(f"Length: {yt.length} seconds")
        
        # Get the best audio stream
        audio_stream = yt.streams.filter(only_audio=True).order_by('abr').desc().first()
        if not audio_stream:
            raise Exception("No audio stream found")
        
        # Create filename from title
        title = yt.title
        name = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f'{name}.webm'
        
        # Download the audio
        print(f"\nDownloading audio...")
        audio_stream.download(filename=filename)
        print("Download completed!")
        
        return filename, title
    except Exception as e:
        print(f"Error downloading video: {str(e)}")
        sys.exit(1)

def convert_to_wav(webm_file: str) -> str:
    """
    Convert audio file to WAV format with specific parameters for Vosk.
    
    Args:
        webm_file (str): Path to the input audio file
        
    Returns:
        str: Path to the converted WAV file
        
    Raises:
        SystemExit: If conversion fails
    """
    try:
        print("\nConverting audio to WAV format...")
        wav_file = webm_file.replace('.webm', '.wav')
        print(f"Converting {webm_file} to {wav_file}")
        
        # Load audio and convert to mono
        audio = AudioSegment.from_file(webm_file)
        audio = audio.set_channels(1)  # Convert to mono
        audio = audio.set_frame_rate(16000)  # Set sample rate to 16kHz
        audio = audio.set_sample_width(2)  # Set to 16-bit
        
        # Export as WAV
        audio.export(wav_file, format="wav")
        print("Conversion completed!")
        return wav_file
    except Exception as e:
        print(f"Error converting audio: {str(e)}")
        sys.exit(1)

def transcribe_audio(wav_file: str) -> str:
    """
    Transcribe audio using Vosk speech recognition.
    
    Args:
        wav_file (str): Path to the WAV audio file
        
    Returns:
        str: Transcribed text
        
    Raises:
        Exception: If transcription fails
    """
    try:
        print("\nTranscribing audio...")
        
        # Get the directory where the script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "vosk-model-small-en-us-0.15")
        
        if not os.path.exists(model_path):
            print(f"Model not found at {model_path}, downloading...")
            # Run the download script
            download_script = os.path.join(script_dir, "download_model.py")
            if os.path.exists(download_script):
                import subprocess
                subprocess.run([sys.executable, download_script], check=True)
            else:
                raise Exception(f"Download script not found at {download_script}")
        
        model = Model(model_path)
        
        # Open WAV file
        wf = wave.open(wav_file, "rb")
        
        # Check if audio is valid
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
            raise Exception("Audio file must be WAV format mono PCM")
        
        # Create recognizer
        recognizer = KaldiRecognizer(model, wf.getframerate())
        recognizer.SetWords(True)
        
        # Process audio
        results = []
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if recognizer.AcceptWaveform(data):
                part = json.loads(recognizer.Result())
                results.append(part)
        
        # Get final result
        part = json.loads(recognizer.FinalResult())
        results.append(part)
        
        # Combine all results
        text = " ".join([part.get("text", "") for part in results])
        return text.strip()
        
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        return f"Error during transcription: {str(e)}"

def improve_transcript(text):
    """Summarize the transcript by processing each chunk and combining summaries."""
    print("\nSummarizing transcript using AI...")
    from transformers import pipeline
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    # BART can handle up to ~1024 tokens (about 1000-1500 words). We'll use up to 4000 characters per chunk.
    max_chunk_length = 4000
    chunks = [text[i:i + max_chunk_length] for i in range(0, len(text), max_chunk_length)]
    print(f"Processing {len(chunks)} chunks...")

    summaries = []
    for i, chunk in enumerate(chunks, 1):
        try:
            summary = summarizer(chunk, max_length=250, min_length=80, do_sample=False)[0]['summary_text']
            summaries.append(summary)
            print(f"Processed chunk {i}/{len(chunks)}")
        except Exception as e:
            print(f"Warning: Could not summarize chunk {i}: {str(e)}")
            summaries.append(chunk[:1000].strip())  # Fallback: use first 1000 chars

    # Combine all summaries
    combined_summary = " ".join(summaries)
    # Clean up spacing
    combined_summary = ' '.join(combined_summary.split())
    return combined_summary

def main() -> None:
    """Main function to orchestrate the video to text process."""
    parser = argparse.ArgumentParser(description='Transcribe YouTube video to text')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--improve', action='store_true', help='Improve the transcription using AI')
    args = parser.parse_args()
    
    # Download audio
    webm_file, video_title = download_audio(args.url)
    
    # Convert to WAV format
    wav_file = convert_to_wav(webm_file)
    
    # Transcribe audio
    transcription = transcribe_audio(wav_file)
    
    # Save original transcription to file
    output_filename = webm_file.replace('.webm', '_transcript.txt')
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(transcription)
    
    print(f"\nOriginal transcription saved to: {output_filename}")
    print("\nOriginal transcription:")
    print(transcription)
    
    # Clean up temporary files
    try:
        os.remove(webm_file)
        os.remove(wav_file)
        print(f"\nCleaned up: Removed temporary files")
    except:
        print(f"\nNote: Could not remove temporary files")
    
    # Improve transcription if requested
    if args.improve:
        print(f"\nProcessing file: {output_filename}")
        print("\nOriginal transcription:")
        print(transcription)
        improved_text = improve_transcript(transcription)
        improved_filename = output_filename.replace('_transcript.txt', '_transcript_improved.txt')
        with open(improved_filename, 'w', encoding='utf-8') as f:
            f.write(improved_text)
        print(f"\nImproved transcription saved to: {improved_filename}")
        print("\nImproved transcription:")
        print(improved_text)
    
    # Print video title in a format that can be easily parsed by the API
    # Make sure to print it at the very end with a clear marker
    print("\n===VIDEO_TITLE_START===")
    print(video_title.strip())
    print("===VIDEO_TITLE_END===")

if __name__ == "__main__":
    main()

