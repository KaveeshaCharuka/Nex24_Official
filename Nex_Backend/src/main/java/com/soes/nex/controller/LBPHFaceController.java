package com.soes.nex.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.service.LBPHFaceService;

@RestController
@RequestMapping("/api/proctor")
@CrossOrigin(origins = "*")
public class LBPHFaceController {

    @Autowired
    private LBPHFaceService lbphService;

    // API 1: Register and train the student's face before exam starts
    @PostMapping("/register-face")
    public ResponseEntity<Map<String, Object>> registerFace(@RequestBody Map<String, String> request) {
        String base64Image = request.get("image");
        boolean success = lbphService.trainStudentModel(base64Image);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Face registered successfully!" : "Failed to capture face. Try again.");
        return ResponseEntity.ok(response);
    }

    // API 2: Verify the face continuously during the exam
    @PostMapping("/verify-face")
    public ResponseEntity<Map<String, Object>> verifyFace(@RequestBody Map<String, String> request) {
        String base64Image = request.get("image");
        String result = lbphService.verifyStudent(base64Image);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", result);

        if (result.equals("MATCHED")) {
            response.put("action", "NONE");
            response.put("message", "Verified successfully.");
        } else if (result.equals("MISMATCHED")) {
            response.put("action", "WARNING");
            response.put("message", "Identity mismatch! Someone else is writing the exam.");
        } else if (result.equals("NO_FACE")) {
            response.put("action", "WARNING");
            response.put("message", "No face detected.");
        } else if (result.equals("MULTIPLE_FACES")) {
            response.put("action", "WARNING");
            response.put("message", "Multiple people detected in frame.");
        }

        return ResponseEntity.ok(response);
    }
}