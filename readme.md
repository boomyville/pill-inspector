# Pill Inspector
Uses computer vision to analyse images of pills

This Python script uses YOLOv8 and OpenCV to detect and count objects in images. 

## Training the model

https://github.com/boomyville/pill-inspector/raw/refs/heads/main/demo/training_model.mp4


Place training images in data/images/train/

Place training labels (text files) in data/labels/train/

Place testing images in data/images/val/

Place testing labels (text files) in data/labels/val/

Ideally have a 4:1 ratio (4 times more images in training than validation)

I used Label Studio running on Docker to perform image tagging

### Create a data.yaml file:

path: path/to/pill-inspector/data  # replace with absolute path

train: images/train

val: images/val

nc: 1  # number of classes

names: ['pill']  # class names

### Create a train.py file and then run it:

from ultralytics import YOLO

model = YOLO('yolov8n.pt')

results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=8,
    name='pill_inspector'
)

### Run the model
python train.py
This will create a model that we can use
model = YOLO('runs/detect/pill_inspector/weights/best.pt')

Place this into models folder

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. Clone or download this repository to your local machine.

2. Install the required Python packages:
```bash
pip install ultralytics opencv-python numpy
```

## Usage
Run the flask script:
```bash
python3 app.py
```

Navigate to http://127.0.0.1:5000/ if running on local machine

## Important Notes

- The script uses YOLOv8n (nano) model which will be downloaded automatically on first run
- Default confidence threshold is set to 0.3

## Troubleshooting

1. If you get module import errors:
   - Make sure you've installed all required packages using pip

## Example usage

![Demo](https://github.com/boomyville/pill-inspector/blob/main/demo/test.png?raw=true)
