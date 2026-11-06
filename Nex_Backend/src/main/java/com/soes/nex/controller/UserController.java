package com.soes.nex.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.model.User;
import com.soes.nex.repository.UserRepository;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.soes.nex.security.TokenBlacklistService tokenBlacklistService;

    @Autowired
    private com.soes.nex.service.NotificationService notificationService;

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username, java.security.Principal principal) {
        User user = userRepository.findByUsername(username);
        if (user == null) user = userRepository.findByEmail(username);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        if (principal == null || (!principal.getName().equals(user.getUsername()) && !principal.getName().equals(user.getEmail()))) {
            return ResponseEntity.status(403).body("Forbidden: IDOR attack prevented");
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("name", user.getUsername());
        profile.put("role", user.getRole());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone() != null ? user.getPhone() : "");
        profile.put("studentId", "N/A"); // Can be extended to fetch from student table
        
        if (user.getProfileImage() != null) {
            profile.put("profileImage", "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(user.getProfileImage()));
        } else {
            profile.put("profileImage", null);
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile/{username}")
    public ResponseEntity<?> updateProfile(@PathVariable String username, @RequestBody Map<String, String> request, java.security.Principal principal) {
        User user = userRepository.findByUsername(username);
        if (user == null) user = userRepository.findByEmail(username);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        if (principal == null || (!principal.getName().equals(user.getUsername()) && !principal.getName().equals(user.getEmail()))) {
            return ResponseEntity.status(403).body("Forbidden: IDOR attack prevented");
        }

        if (request.containsKey("phone")) {
            user.setPhone(request.get("phone"));
        }

        if (request.containsKey("profileImage")) {
            String base64Image = request.get("profileImage");
            if (base64Image != null && base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }
            if (base64Image != null && !base64Image.isEmpty()) {
                user.setProfileImage(Base64.getDecoder().decode(base64Image));
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PutMapping("/password/{username}")
    public ResponseEntity<?> updatePassword(@PathVariable String username, @RequestBody Map<String, String> request, java.security.Principal principal) {
        User user = userRepository.findByUsername(username);
        if (user == null) user = userRepository.findByEmail(username);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        if (principal == null || (!principal.getName().equals(user.getUsername()) && !principal.getName().equals(user.getEmail()))) {
            return ResponseEntity.status(403).body("Forbidden: IDOR attack prevented");
        }

        String currentPass = request.get("currentPass");
        String newPass = request.get("newPass");

        if (!passwordEncoder.matches(currentPass, user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password!");
        }

        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);

        // Revoke all existing tokens for this user to prevent session hijacking
        tokenBlacklistService.revokeAllUserTokens(user.getUsername());
        if (user.getEmail() != null) {
            tokenBlacklistService.revokeAllUserTokens(user.getEmail());
        }

        notificationService.sendNotification(
            user.getUsername(),
            user.getRole(),
            "Security Alert: Password Updated",
            "Your Nex24 account password was updated successfully. If you did not make this change, please contact your administrator.",
            "WARNING",
            null,
            true
        );

        return ResponseEntity.ok("Password updated successfully");
    }
}
