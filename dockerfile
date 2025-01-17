FROM python:3.8-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*
COPY flask_app.py /app/flask_app.py
COPY requirements.txt /app/requirements.txt
COPY templates/ /app/templates/
COPY static/ /app/static/
COPY models/ /app/models/
RUN pip3 install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt
EXPOSE 5000
CMD ["python", "flask_app.py"]
