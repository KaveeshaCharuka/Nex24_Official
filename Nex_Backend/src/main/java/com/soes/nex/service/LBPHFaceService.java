package com.soes.nex.service;

import java.util.Base64;

import org.bytedeco.javacpp.Loader;
import org.bytedeco.opencv.opencv_java;
import org.opencv.core.Mat;
import org.opencv.core.MatOfRect;
import org.opencv.face.LBPHFaceRecognizer;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.objdetect.CascadeClassifier;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class LBPHFaceService {

    private CascadeClassifier faceDetector;
    private LBPHFaceRecognizer faceRecognizer;
    private boolean isModelTrained = false;

    // STEP 1: Initialize OpenCV and LBPH Model
    @PostConstruct
    public void init() {

        // 💡 openpnp eke OpenCV.loadLocally() wenuwata,
        // bytedeco eke native library eka load karanawa (face/contrib module ekath ekka)
        Loader.load(opencv_java.class);
        System.out.println("OpenCV Loaded Successfully! (bytedeco native)");

        faceDetector = new CascadeClassifier("haarcascade_frontalface_alt.xml");

        if (faceDetector.empty()) {
            throw new RuntimeException("Cannot load haarcascade_frontalface_alt.xml");
        }

        faceRecognizer = LBPHFaceRecognizer.create();

        System.out.println("LBPH Recognizer Initialized");
    }

    // STEP 2: Convert Base64 from frontend to OpenCV Mat image
    private Mat base64ToMat(String base64Image) {
        if (base64Image.contains(",")) {
            base64Image = base64Image.split(",")[1];
        }
        byte[] imageBytes = Base64.getDecoder().decode(base64Image);
        System.out.println("[DEBUG] Decoded byte array length: " + imageBytes.length);

        // Correct way: Wrap byte array into MatOfByte for imdecode
        org.opencv.core.MatOfByte matOfByte = new org.opencv.core.MatOfByte(imageBytes);
        Mat img = Imgcodecs.imdecode(matOfByte, Imgcodecs.IMREAD_GRAYSCALE);

        System.out.println("[DEBUG] Mat empty? " + img.empty()
                + " | size: " + img.size().width + "x" + img.size().height);

        return img;
    }

 // STEP 3: Train the model with student's reference face at the beginning of exam
    public boolean trainStudentModel(String base64Image) {
        try {
            Mat img = base64ToMat(base64Image);

            if (img.empty()) {
                System.out.println("[DEBUG] Image decode failed - Mat is empty!");
                return false;
            }

            // 💡 අලුත් කෑල්ල: අඳුරු පින්තූර වල එළිය සහ Contrast එක ඔටෝ හදන්න (Histogram Equalization)
            // මේකෙන් සාමාන්‍ය ලැප්ටොප් කැමරාවක වුණත් මූණ පැහැදිලිව අඳුරගන්නවා.
            Mat enhancedImg = new Mat();
            org.opencv.imgproc.Imgproc.equalizeHist(img, enhancedImg);

            MatOfRect faces = new MatOfRect();
            
            // 💡 img වෙනුවට enhancedImg එක පාවිච්චි කරනවා
            faceDetector.detectMultiScale(
                    enhancedImg,
                    faces,
                    1.1, // Scale Factor: 1.1 (පොඩි වෙනස්කම් පවා අල්ලගන්නවා)
                    3,   // Min Neighbors: 3 (කැමරාව අවුල් වුණත් ලේසියෙන් මූණක් කියලා තහවුරු කරනවා)
                    0,
                    new org.opencv.core.Size(60, 60), // මූණක අවම සයිස් එක
                    new org.opencv.core.Size()
            );

            System.out.println("[DEBUG] Faces detected during training: " + faces.toArray().length);

            if (faces.toArray().length == 1) {
                // Crop and isolate the face area (Contrast එක වැඩි කරපු පින්තූරෙන්ම කපනවා)
                org.opencv.core.Rect rect = faces.toArray()[0];
                Mat faceImg = new Mat(enhancedImg, rect);

                // Train LBPH with the student's face (Label id = 1)
                java.util.List<Mat> images = new java.util.ArrayList<>();
                images.add(faceImg);

                Mat labels = new Mat(1, 1, org.opencv.core.CvType.CV_32SC1);
                labels.put(0, 0, new int[] { 1 });

                faceRecognizer.train(images, labels);
                isModelTrained = true;
                
                System.out.println("[DEBUG] 🚀 Model trained successfully!");
                return true;
            } else if (faces.toArray().length > 1) {
                System.out.println("[DEBUG] Multiple faces detected! Cannot train.");
            } else {
                System.out.println("[DEBUG] No faces detected! Please adjust camera lighting.");
            }
            
            return false;
            
        } catch (Exception e) {
            System.out.println("[DEBUG] Error during model training: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // STEP 4: Recognize face during the exam and verify identity
    public String verifyStudent(String base64Image) {
        if (!isModelTrained) {
            return "NOT_TRAINED";
        }
        try {
            Mat img = base64ToMat(base64Image);

            if (img.empty()) {
                System.out.println("[DEBUG] Image decode failed - Mat is empty!");
                return "ERROR";
            }

            MatOfRect faces = new MatOfRect();
            // scaleFactor, minNeighbors, flags, minSize wisthara widiyata dila
            // face patta wenas wenas walata detect wena parameters
            faceDetector.detectMultiScale(
                    img,
                    faces,
                    1.1,
                    3,
                    0,
                    new org.opencv.core.Size(60, 60),
                    new org.opencv.core.Size()
            );

            System.out.println("[DEBUG] Faces detected: " + faces.toArray().length);

            if (faces.toArray().length == 0)
                return "NO_FACE";
            if (faces.toArray().length > 1)
                return "MULTIPLE_FACES";

            // Crop the face for matching
            org.opencv.core.Rect rect = faces.toArray()[0];
            Mat faceImg = new Mat(img, rect);

            int[] label = new int[1];
            double[] confidence = new double[1];

            // LBPH Prediction
            faceRecognizer.predict(faceImg, label, confidence);

            // Lower confidence means closer match in LBPH (Threshold around 65.0)
            if (label[0] == 1 && confidence[0] < 65.0) {
                return "MATCHED";
            } else {
                return "MISMATCHED";
            }
        } catch (Exception e) {
            return "ERROR";
        }
    }
}