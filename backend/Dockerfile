!FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY ./requirements.txt /app/requirements.txt

# Install PyTorch for CPU explicitly first
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual backend code logic into the Docker image
COPY . .

# Hugging Face Spaces mandates serving on port 7860
EXPOSE 7860

# Launch Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
