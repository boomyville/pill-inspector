from ultralytics import YOLO
import cv2
import numpy as np
import os

def find_image_file():
    """
    Look for an image file (PNG or JPG/JPEG) in the current directory
    
    Returns:
        str: Path to the first image file found
    """
    valid_extensions = ['.png', '.jpg', '.jpeg']
    current_dir = os.getcwd()
    print(f"Searching for images in: {current_dir}")
    
    files = os.listdir(current_dir)
    print(f"Files found in directory: {files}")
    
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in valid_extensions:
            full_path = os.path.join(current_dir, file)
            print(f"Found image file: {full_path}")
            print(f"File exists: {os.path.exists(full_path)}")
            print(f"File size: {os.path.getsize(full_path)} bytes")
            return full_path
    return None

def count_objects(image_path, confidence_threshold=0.3):
    """
    Count objects in an image using YOLOv8
    
    Args:
        image_path (str): Path to the image file
        confidence_threshold (float): Minimum confidence score for detection
        
    Returns:
        int: Number of detected objects
        image: Annotated image with detections
    """
    print(f"Attempting to load image from: {image_path}")
    
    # Test image loading with OpenCV
    image = cv2.imread(image_path)
    if image is None:
        print(f"OpenCV failed to load image. Testing if file exists...")
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file does not exist: {image_path}")
        else:
            raise ValueError(f"Image file exists but could not be read: {image_path}")
    
    # Load the YOLO model
    print("Loading YOLO model...")
    model = YOLO('best.pt')
    
    # Run inference
    print("Running inference...")
    results = model(image_path)[0]
    
    # Count detections above confidence threshold
    detections = len([detection for detection in results.boxes.data 
                     if detection[4] >= confidence_threshold])
    
    return detections, results.plot()

def main():
    try:
        # Look for image file
        image_path = find_image_file()
        if image_path is None:
            print("Error: No PNG or JPG/JPEG image found in the current directory")
            return
            
        print(f"Processing image: {image_path}")
        
        # Count objects and get visualization
        count, annotated_image = count_objects(image_path)
        
        # Print results
        print(f"Number of objects detected: {count}")
        
        # Save visualization
        output_path = 'detected_objects.jpg'
        success = cv2.imwrite(output_path, annotated_image)
        if not success:
            print(f"Error: Failed to save visualization to {output_path}")
        else:
            print(f"Visualization saved as '{output_path}'")
        
    except FileNotFoundError as e:
        print(f"Error: Could not load the image file - {str(e)}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback
        print("Full error trace:")
        print(traceback.format_exc())

if __name__ == "__main__":
    main()