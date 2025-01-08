# Pill Inspector
Uses computer vision to analyse images of pills
This Python script uses YOLOv8 and OpenCV to detect and count objects in images. 

## Training the model
Setup the following folder structure:

pill_detection/
├── data/
│   ├── images/
│   │   ├── train/
│   │   └── val/
│   └── labels/
│       ├── train/
│       └── val/
└── data.yaml

Place training images in data/images/train/
Place testing images in data/images/val/
Ideally 4:1 ratio

Both folders should contain YOLO annotation format
I used Label Studio running on Docker to perform image tagging

### Create a data.yaml file:

path: path/to/your/pill_detection/data  # replace with absolute path
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
    name='pill_detector'
)

### Run the model
python train.py
This will create a model that we can use
model = YOLO('runs/detect/pill_detector/weights/best.pt')

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

1. Place your image file in the same directory as the script. The script supports:
   - PNG files (*.png)
   - JPG/JPEG files (*.jpg, *.jpeg)

2. Run the script:
```bash
python main.py
```

The script will automatically find and process the first image file it finds in the directory and output the number of objects detected.

## Important Notes

- The script uses YOLOv8n (nano) model which will be downloaded automatically on first run
- Default confidence threshold is set to 0.3
- If multiple images are present in the directory, the script will process the first one it finds

## Troubleshooting

Common issues:

1. If you get "No PNG or JPG/JPEG image found":
   - Make sure you have at least one image file with the extension .png, .jpg, or .jpeg in the script's directory

2. If you get module import errors:
   - Make sure you've installed all required packages using pip
