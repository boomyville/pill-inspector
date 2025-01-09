from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.spinner import Spinner
from kivy.uix.image import Image
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.utils import platform
from ultralytics import YOLO
import cv2
import os
from datetime import datetime, timedelta
import numpy as np
from kivy.graphics.texture import Texture
from kivy.properties import ObjectProperty
import threading

class ObjectDetectionApp(App):
    def build(self):
        return ObjectDetectionLayout()

class ObjectDetectionLayout(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = 'vertical'
        self.padding = 10
        self.spacing = 10
        
        # Configure folders
        self.models_folder = 'models'
        self.results_folder = 'results'
        os.makedirs(self.models_folder, exist_ok=True)
        os.makedirs(self.results_folder, exist_ok=True)
        
        # Initialize model cache
        self.loaded_models = {}
        
        # Create UI elements
        self.setup_ui()
        
        # Schedule cleanup
        Clock.schedule_interval(self.cleanup_old_files, 3600)  # Check every hour
        
    def setup_ui(self):
        # Model selection spinner
        self.model_spinner = Spinner(
            text='General identification',
            values=self.get_model_names(),
            size_hint=(1, 0.1)
        )
        self.add_widget(self.model_spinner)
        
        # Image display
        self.image_display = Image(size_hint=(1, 0.6))
        self.add_widget(self.image_display)
        
        # Results label
        self.result_label = Label(
            text='No detections yet',
            size_hint=(1, 0.1)
        )
        self.add_widget(self.result_label)
        
        # Buttons layout
        button_layout = BoxLayout(
            orientation='horizontal',
            size_hint=(1, 0.2),
            spacing=10
        )
        
        # Camera button
        self.camera_button = Button(
            text='Take Photo',
            on_press=self.capture_image
        )
        button_layout.add_widget(self.camera_button)
        
        # Gallery button
        self.gallery_button = Button(
            text='Choose from Gallery',
            on_press=self.choose_image
        )
        button_layout.add_widget(self.gallery_button)
        
        self.add_widget(button_layout)
    
    def get_model_names(self):
        """Get list of available models"""
        models = []
        for filename in os.listdir(self.models_folder):
            if filename.endswith('.pt'):
                base_name = os.path.splitext(filename)[0]
                if base_name == 'yolov8n':
                    display_name = 'General identification'
                else:
                    display_name = base_name.replace('_', ' ').title()
                models.append(display_name)
        return models or ['General identification']
    
    def get_model(self, display_name):
        """Load and cache the selected model"""
        # Convert display name back to filename
        if display_name == 'General identification':
            filename = 'yolov8n.pt'
        else:
            filename = display_name.lower().replace(' ', '_') + '.pt'
        
        if filename not in self.loaded_models:
            model_path = os.path.join(self.models_folder, filename)
            if not os.path.exists(model_path):
                raise ValueError(f"Model file {filename} not found")
            self.loaded_models[filename] = YOLO(model_path)
        return self.loaded_models[filename]
    
    def capture_image(self, instance):
        """Handle camera capture"""
        if platform == 'android':
            from android.permissions import request_permissions, Permission
            request_permissions([Permission.CAMERA])
            
        # Here you would implement camera capture
        # For Android, you'd use the camera API
        # This is a placeholder that would need to be implemented
        pass
    
    def choose_image(self, instance):
        """Handle image selection from gallery"""
        if platform == 'android':
            from android.permissions import request_permissions, Permission
            request_permissions([Permission.READ_EXTERNAL_STORAGE])
            
        # Here you would implement file choosing
        # For Android, you'd use the file picker API
        # This is a placeholder that would need to be implemented
        pass
    
    def process_image(self, image_path):
        """Process image with selected model"""
        try:
            # Get selected model
            model = self.get_model(self.model_spinner.text)
            
            # Run detection in a separate thread
            threading.Thread(target=self._run_detection, args=(model, image_path)).start()
            
        except Exception as e:
            self.result_label.text = f'Error: {str(e)}'
    
    def _run_detection(self, model, image_path):
        """Run detection in background thread"""
        try:
            # Run detection
            results = model(image_path)[0]
            
            # Count detections
            detections = len(results.boxes.data)
            
            # Save annotated image
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = os.path.join(self.results_folder, f'detected_{timestamp}.jpg')
            cv2.imwrite(output_path, results.plot())
            
            # Update UI in main thread
            Clock.schedule_once(lambda dt: self.update_results(output_path, detections))
            
        except Exception as e:
            Clock.schedule_once(lambda dt: setattr(self.result_label, 'text', f'Error: {str(e)}'))
    
    def update_results(self, image_path, detection_count):
        """Update UI with detection results"""
        # Update image display
        self.image_display.source = image_path
        self.image_display.reload()
        
        # Update detection count
        self.result_label.text = f'Found {detection_count} objects'
    
    def cleanup_old_files(self, dt):
        """Remove files older than 24 hours from results folder"""
        current_time = datetime.now()
        max_age = timedelta(hours=24)
        
        for filename in os.listdir(self.results_folder):
            filepath = os.path.join(self.results_folder, filename)
            try:
                file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
                if current_time - file_time > max_age:
                    os.remove(filepath)
            except (OSError, ValueError) as e:
                print(f"Error processing {filename}: {e}")

if __name__ == '__main__':
    ObjectDetectionApp().run()