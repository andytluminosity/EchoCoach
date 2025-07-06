# run: pip install face_detection@git+https://github.com/elliottzheng/face-detection
# and run: pip install nitec
# then just run this python file from the backend directory.

import torch
from nitec import NITEC_Classifier, visualize
import cv2
import pathlib
CWD = pathlib.Path.cwd()

nitec_pipeline = NITEC_Classifier(
    weights= CWD / "pytorch_folder" / "nitec" / "models" / 'nitec_rs18_e20.pth',
    device=torch.device('cpu') # or 'cpu'
)
 
cap = cv2.VideoCapture(0)

with torch.no_grad():
    while cap.isOpened():
        _, frame = cap.read()    
        # Process frame and visualize
        results = nitec_pipeline.predict(frame)
        frame = visualize(frame, results, confidence=0.5)

        cv2.imshow("NITEC", frame)
        cv2.waitKey(1)