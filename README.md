---
title: VoiceKey Biometric Auth
emoji: "🎤"
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# VoiceKey: Biometric Voice Authentication System

A complete, production-ready full-stack web application designed for secure biometric voice authentication. It utilizes state-of-the-art Deep Learning (ECAPA-TDNN) for speaker verification and heuristic audio flat-lining/zero-crossing rate checks for liveness spoofing detection. 

## System Architecture
**1. Frontend**: A React + Vite single-page application.
- Utilizes `MediaRecorder` API to capture the user's microphone securely.
- Responsive, glassmorphism UI designed for premium aesthetics.
- Captures voice samples with `MediaRecorder` and sends WebM `Blob` payloads via `FormData` to the backend.

**2. Backend API**: FastAPI (Python 3.10)
- Endpoints designed for high throughput, protected by `slowapi` rate limits.
- SQLite Database using SQLAlchemy ORM to store User metadata and their 192-dimensional Voice Embeddings.
- JWT configured for secure, stateless session management (30 min expiry).

**3. Audio & ML Core**: `speechbrain` and `pydub`
- Incoming audio is dynamically handled via `ffmpeg` wrapper (`pydub`) to enforce 16kHz Mono WAV formatting. 
- The ECAPA-TDNN network extracts high-level acoustic features, computing a 192-dimensional vector.
- Verification uses Cosine Similarity scoring to compare live embeddings against registered embeddings. 
- An advanced Identification mode compares audio against *all* users if login username is omitted.

**4. Security Design**:
- **Anti-Spoofing (Liveness)**: Evaluates Spectral Flatness and Zero-Crossing Rate to identify robotic, flat, or synthetic pre-recorded playbacks.
- **Data Protection**: Stores biometric vectors passively as binary Blobs instead of raw audio. Passwords are theoretically unnecessary, though JWT ensures standard web security post-login.
- **Resource Limits**: Configured strictly without `uvicorn --reload` to maintain singular Model Instance loading, saving memory and eliminating Windows multiprocessing threading collisions.

---

## ðŸš€ Setup Guide (Windows Native Environment)

### Prerequisites
- Python 3.10 installed (`python --version` to check).
- Install **FFmpeg** on Windows:
  1. Download latest build from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) or use `winget install ffmpeg`.
  2. Extract the folder and add `/bin` path to your System Environment variables (PATH).
  3. Verify by running `ffmpeg -version` in CMD.

### Installation
1. Move to the directory: `cd voice_auth_system`
2. Create Virtual Environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install Pinned Requirements:
   ```cmd
   pip install -r requirements.txt
   ```

### Execution
Start the backend *without* reload to prevent multiprocessing clashes with SpeechBrain/Windows.
```cmd
python backend/main.py
```
*Note: Your application will automatically host frontend static files. Visit `http://127.0.0.1:8000` in your web browser.*

---

## ðŸ³ Deployment Instructions (Docker)

If you prefer containerized deployment for production environments, use the included Dockerfile.

1. Build the image:
   ```bash
   docker build -t voice_auth_app .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 -d voice_auth_app
   ```

*The setup installs `ffmpeg` on a Debian base inside the container automatically and defaults to 1 worker for low-memory environments (like HF Spaces).*

### Hugging Face Spaces (Docker) Notes
- `PORT` is set to `7860` in the Dockerfile.
- Model files are downloaded from Hugging Face Hub at runtime and cached under `/tmp`.
- Do not commit `node_modules/`, `backend/pretrained_models/`, `backend/temp_audio/`, or virtual environments.

---

## ðŸ› ï¸ Windows Troubleshooting Guide

**1. "Symlink Warning" or "Access Denied" by HuggingFace Hub**
- **Cause**: Windows requires Developer Mode or Admin rights to create symbolic links, which HuggingFace Hub tries to do by default.
- **Solution**: Already handled in codebase. `HF_HUB_DISABLE_SYMLINKS=1` is injected into the environment runtime before module loads.

**2. WinError 32: The process cannot access the file because it is being used by another process**
- **Cause**: Reloading Uvicorn causes multiple overlapping processes to attempt to lock SQLite or SpeechBrain model downloads.
- **Solution**: Never run with `uvicorn main:app --reload`. Only run `python backend/main.py` directly.

**3. "FFmpeg not found" error during Voice login/registration.**
- **Cause**: Pydub cannot locate FFmpeg in your Windows PATH.
- **Solution**: Follow the FFmpeg prerequisites. Ensure you restart your command prompt after adding FFmpeg to PATH.

**4. Pytorch multiprocessing freeze**
- **Cause**: Multithreading issues with DataLoader in Windows.
- **Solution**: Model execution is forced to `CPU` and multiprocessing bounds are bypassed by direct inference methods in `ml_engine.py`.

---

## ðŸ“¡ API Usage Instructions

For automated testing, navigate to the auto-generated Swagger UI: `http://localhost:8000/docs`.

### Key Endpoints:
- `POST /api/register`
  - Accepts `username` (string) and `audio1`, `audio2`, `audio3` (file chunks). 
  - Extracts and saves the voice embedding if liveness passes.
  
- `POST /api/login`
  - Accepts `audio` (file chunk), `challenge_id`, and optional `username`. 
  - Validates liveness constraints. Returns JWT string and risk metric data. If username is blank, performs global search among all records (Open-set identification).

- `GET /api/liveness-phrase`
  - Fetch random human-readable challenges for active authorization.

- `GET /api/admin/users`
  - Retrieve current registered system profiles.
  
- `DELETE /api/admin/users/{id}`
  - Perform backend erasure of user biometrics.
# voice-auth

