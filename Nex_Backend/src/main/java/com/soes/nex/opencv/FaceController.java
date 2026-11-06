package com.soes.nex.opencv;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/face")
@CrossOrigin(origins = "*") // Allows any frontend to connect (React, Vue, etc.)
public class FaceController {

    private final FaceRegistrationService faceService;

    @Autowired
    public FaceController(FaceRegistrationService faceService) {
        this.faceService = faceService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerFace(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String imageData = request.get("image");

        if (userId == null || imageData == null) {
            return ResponseEntity.badRequest().body("Missing data");
        }

        boolean isSuccess = faceService.registerFace(userId, imageData);
        if (isSuccess) {
            return ResponseEntity.ok("✅ Face Verified!");
        } else {
            return ResponseEntity.badRequest().body("❌ No face detected.");
        }
    }
}