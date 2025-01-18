# Use the official Python 3.8 slim image as the base image
FROM python:3.8-slim

# Set the working directory within the container
WORKDIR /app

# Install necessary system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
  libglib2.0-0 \
  libsm6 \
  libxrender1 \
  libxext6 \
  libgl1-mesa-dev \
  && rm -rf /var/lib/apt/lists/*

# Copy the application files into the container
COPY flask_app.py /app/flask_app.py
COPY requirements.txt /app/requirements.txt

# Copy the templates and static files
COPY templates/ /app/templates/
COPY static/ /app/static/
COPY models/ /app/models/

# Install Python dependencies
RUN pip3 install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt

# Expose port 5000 for the Flask application
EXPOSE 5000

# Define the command to run the Flask application
CMD ["python", "flask_app.py"]
