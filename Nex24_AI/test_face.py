import cv2
import torch
from ultralytics import YOLO

print("Testing environment setup...")

try:
    # 1. Test YOLO Model Loading
    model = YOLO("yolov8n.pt")
    print("SUCCESS: YOLO model loaded successfully!")

    # 2. Test OpenCV
    print("OpenCV Version:", cv2.__version__)

    # 3. Test PyTorch Engine
    print("PyTorch Version:", torch.__version__)
    print("\nSUCCESS: All AI dependencies are ready for Nex24 System!")

except Exception as e:
    print("Error during setup test:", str(e))