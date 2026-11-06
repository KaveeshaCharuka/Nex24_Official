package com.soes.nex.opencv;

import java.io.File;
import java.io.IOException;
import java.util.Base64;

import static org.bytedeco.opencv.global.opencv_imgcodecs.imread;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.RectVector;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class FaceRegistrationService {

    private CascadeClassifier faceDetector;
    private boolean isLibraryLoaded = false;

    @PostConstruct
    public void init() {
        loadNativeLibrary();
        
        // Haar Cascade XML ෆයිල් එක ලෝඩ් කිරීම
        File cascadeFile = new File("haarcascade_frontalface_alt.xml");
        if (cascadeFile.exists()) {
            faceDetector = new CascadeClassifier(cascadeFile.getAbsolutePath());
            System.out.println("✅ Haar Cascade Loaded Successfully!");
        } else {
            System.out.println("❌ Error: haarcascade_frontalface_alt.xml not found!");
        }
    }

    public void loadNativeLibrary() {
        if (!isLibraryLoaded) {
            try {
                org.bytedeco.javacpp.Loader.load(org.bytedeco.opencv.global.opencv_core.class);
                isLibraryLoaded = true;
                System.out.println("✅ OpenCV Native Libraries Loaded!");
            } catch (Throwable e) {
                System.out.println("❌ Cannot load OpenCV libraries: " + e.getMessage());
            }
        }
    }

    public boolean registerFace(String userId, String base64Image) {
        try {
            if (base64Image == null || base64Image.isEmpty()) {
                System.out.println("❌ Error: Received image data is empty!");
                return false;
            }
            
            String imageBytes;
            // 💡 ෆ්‍රන්ට්එන්ඩ් එකෙන් "data:image/jpeg;base64," කෑල්ල එව්වත් නැතත් දෙකම Handle කරනවා
            if (base64Image.contains(",")) {
                imageBytes = base64Image.split(",")[1];
            } else {
                imageBytes = base64Image;
            }

            // ස්ට්‍රින්ග් එකේ මැද තියෙන අනවශ්‍ය හිස්තැන් (Spaces/Newlines) අයින් කිරීම
            imageBytes = imageBytes.trim().replaceAll("\\s+", "");
            
            // Base64 සෝස් එක බයිට් ඇරේ එකකට ඩිකෝඩ් කිරීම
            byte[] data = Base64.getDecoder().decode(imageBytes);

            // ෆොටෝ සේව් වෙන්න ඕනේ ෆෝල්ඩර් එක හැදීම
            File outputDir = new File("registered_faces");
            if (!outputDir.exists()) {
                outputDir.mkdirs();
            }

            // ඉමේජ් එක ෆයිල් එකක් විදිහට සේව් කිරීම
            File outputFile = new File(outputDir, userId + ".jpg");
            java.nio.file.Files.write(outputFile.toPath(), data);
            System.out.println("💾 Image saved temporarily: " + outputFile.getAbsolutePath());

            // OpenCV මගින් ඉමේජ් එක කියවීම
            Mat image = imread(outputFile.getAbsolutePath());
            if (image.empty()) {
                System.out.println("❌ OpenCV matrix is empty. Invalid image format received.");
                outputFile.delete();
                return false;
            }

            RectVector faces = new RectVector();
            faceDetector.detectMultiScale(image, faces);

            // මූණක් අහුවුණේ නැත්නම් ෆයිල් එක ඩිලීට් කරලා බොරු රෙජිස්ට්‍රේෂන් නවත්වනවා
            if (faces.size() == 0) {
                System.out.println("❌ Face Verification Failed: No face detected in the captured image.");
                outputFile.delete();
                return false;
            }

            System.out.println("✅ Face Successfully Detected! User Registered: " + userId);
            return true;
            
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Base64 Decoding failed (Bad data format from frontend): " + e.getMessage());
            return false;
        } catch (IOException e) {
            System.out.println("❌ File processing error: " + e.getMessage());
            return false;
        } catch (RuntimeException e) {
            System.out.println("❌ General Processing Error: " + e.getMessage());
            return false;
        }
    }
}