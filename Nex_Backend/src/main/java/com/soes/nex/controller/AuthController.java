package com.soes.nex.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.dto.LoginRequest;
import com.soes.nex.dto.RegisterRequest;
import com.soes.nex.model.Examiner;
import com.soes.nex.model.Student;
import com.soes.nex.model.User;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;
import com.soes.nex.security.JwtUtil;
import com.soes.nex.security.OtpSecurityService;
import com.soes.nex.security.TokenBlacklistService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpSecurityService otpSecurityService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private com.soes.nex.repository.ExaminerRepository examinerRepository;

    // 1. Institute Registration
    @PostMapping("/register-institute")
    public ResponseEntity<?> registerInstitute(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null) email = request.get("officialEmail");

            String adminName = request.get("adminName");
            if (adminName == null) adminName = request.get("username");

            String password = request.get("password");

            if (email == null || !email.contains("@")) {
                return ResponseEntity.badRequest().body("Error: Valid email address is required!");
            }
            if (password == null || password.length() < 6) {
                return ResponseEntity.badRequest().body("Error: Password must be at least 6 characters!");
            }

            if (userRepository.findByEmail(email) != null) {
                return ResponseEntity.badRequest().body("Error: Email is already registered!");
            }

            User newAdmin = new User();
            newAdmin.setEmail(email.trim().toLowerCase());
            newAdmin.setUsername(adminName != null ? adminName.trim() : "Admin");
            newAdmin.setPassword(passwordEncoder.encode(password)); 
            newAdmin.setRole("INSTITUTE_ADMIN"); 

            userRepository.save(newAdmin);
            return ResponseEntity.ok("Institute Registered Successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // 2. Login (Username, Email, or Student Index)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String identifier = request.getUsername();
            if (identifier == null || identifier.trim().isEmpty()) {
                return ResponseEntity.status(401).body("Invalid Credentials: Username/Email/Index required");
            }
            identifier = identifier.trim();

            User user = userRepository.findByUsername(identifier);
            if (user == null) {
                user = userRepository.findByEmail(identifier);
            }
            if (user == null) {
                Optional<Student> opt = studentRepository.findByIndexNumber(identifier);
                if (opt.isPresent() && opt.get().getUser() != null) {
                    user = opt.get().getUser();
                }
            }

            if (user == null) {
                return ResponseEntity.status(401).body("Invalid Credentials: User not found");
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid Credentials: Password mismatch");
            }

            String principal = (user.getUsername() != null && !user.getUsername().isEmpty()) 
                                ? user.getUsername() : user.getEmail();

            String token = jwtUtil.generateToken(principal);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("username", user.getUsername());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }

    // 3. Public Registration (Prevents Privilege Escalation by restricting to STUDENT)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Username is required!");
            }
            if (request.getPassword() == null || request.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Error: Password must be at least 6 characters!");
            }

            if (userRepository.findByUsername(request.getUsername()) != null) {
                return ResponseEntity.badRequest().body("Error: Username already exists!");
            }

            if (userRepository.findByEmail(request.getEmail()) != null) {
                return ResponseEntity.badRequest().body("Error: Email already exists!");
            }

            // Defense against Privilege Escalation: Public registrations cannot assign ADMIN or EXAMINER roles
            String assignedRole = "STUDENT";

            User user = new User();
            user.setUsername(request.getUsername().trim());
            user.setEmail(request.getEmail().trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(assignedRole);

            userRepository.save(user);

            Student student = new Student();
            student.setUser(user);
            studentRepository.save(student);

            return ResponseEntity.ok("User Registered Successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // 4. Student Account Activation (Protected with OTP Brute-Force Defense)
    @PostMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestBody Map<String, String> request) {
        try {
            String tempUsername = request.get("tempUsername");
            String otp = request.get("otp");
            String newUsername = request.get("newUsername");
            String newPassword = request.get("newPassword");
            String faceBase64 = request.get("faceBase64");

            if (tempUsername == null || otp == null) {
                return ResponseEntity.badRequest().body("Error: Activation credentials missing!");
            }

            // OTP Brute-Force & Expiration Defense
            if (otpSecurityService.isLocked(tempUsername)) {
                return ResponseEntity.status(429).body("Error: Account locked due to excessive failed attempts. Please contact Administrator.");
            }

            if (otpSecurityService.isOtpExpired(tempUsername)) {
                return ResponseEntity.badRequest().body("Error: OTP has expired. Please contact Administrator for a new invitation.");
            }

            Optional<Student> studentOpt = studentRepository.findByTempUsername(tempUsername);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Invalid activation token!");
            }

            Student student = studentOpt.get();
            if (student.getOtp() == null || !student.getOtp().equals(otp.trim())) {
                otpSecurityService.recordFailedAttempt(tempUsername);
                int remaining = otpSecurityService.getRemainingAttempts(tempUsername);
                if (remaining == 0) {
                    student.setOtp(null);
                    studentRepository.save(student);
                    return ResponseEntity.status(429).body("Error: Account locked. Too many invalid attempts.");
                }
                return ResponseEntity.badRequest().body("Error: Invalid OTP! Remaining attempts: " + remaining);
            }

            // Base64 Payload Overload Defense
            if (faceBase64 != null && faceBase64.length() > 7 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Error: Face image payload exceeds maximum allowed size (5MB).");
            }

            if (userRepository.findByUsername(newUsername) != null) {
                return ResponseEntity.badRequest().body("Error: Username is already taken!");
            }

            User newUser = new User();
            newUser.setUsername(newUsername.trim());
            newUser.setPassword(passwordEncoder.encode(newPassword));
            newUser.setEmail(student.getEmail());
            newUser.setRole("STUDENT");
            userRepository.save(newUser);

            if (faceBase64 != null) {
                String cleanBase64 = faceBase64.contains(",") ? faceBase64.split(",")[1] : faceBase64;
                byte[] decodedFaceBytes = Base64.getDecoder().decode(cleanBase64);
                student.setFaceIdData(decodedFaceBytes);
            }

            student.setUser(newUser);
            student.setFaceRegistered(true);
            student.setTempUsername(null);
            student.setOtp(null);
            studentRepository.save(student);

            otpSecurityService.clear(tempUsername);

            return ResponseEntity.ok("Account Activated Successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // 5. Examiner Setup (Protected with OTP Brute-Force Defense)
    @PostMapping("/setup-examiner")
    public ResponseEntity<?> setupExaminer(@RequestBody Map<String, String> request) {
        try {
            String tempUsername = request.get("tempUsername");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");

            if (tempUsername == null || otp == null) {
                return ResponseEntity.badRequest().body("Error: Setup credentials missing!");
            }

            if (otpSecurityService.isLocked(tempUsername)) {
                return ResponseEntity.status(429).body("Error: Account locked due to excessive failed attempts.");
            }

            User user = userRepository.findByUsername(tempUsername);
            if (user == null || !"EXAMINER".equals(user.getRole())) {
                return ResponseEntity.badRequest().body("Invalid Examiner Username!");
            }

            if (!passwordEncoder.matches(otp.trim(), user.getPassword())) {
                otpSecurityService.recordFailedAttempt(tempUsername);
                int remaining = otpSecurityService.getRemainingAttempts(tempUsername);
                return ResponseEntity.badRequest().body("Invalid OTP Code! Remaining attempts: " + remaining);
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            Examiner examiner = examinerRepository.findByUser(user);
            if (examiner != null) {
                examiner.setPassword(passwordEncoder.encode(newPassword));
                examiner.setRegistered(true);
                examiner.setTempPassword(null);
                examinerRepository.save(examiner);
            }

            otpSecurityService.clear(tempUsername);

            return ResponseEntity.ok("Account Setup Successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // 6. Mid-Exam Token Expiration Defense: Silent Token Refresh
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String oldToken = authHeader.substring(7);
        String newToken = jwtUtil.refreshToken(oldToken);

        if (newToken == null) {
            return ResponseEntity.status(401).body("Token is expired or invalid. Please re-authenticate.");
        }

        Map<String, String> response = new HashMap<>();
        response.put("token", newToken);
        return ResponseEntity.ok(response);
    }

    // 7. Token Hijacking Prevention: Revoke JWT on Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                long expiry = jwtUtil.extractExpiration(token).getTime();
                tokenBlacklistService.blacklistToken(token, expiry);
            } catch (Exception e) {
                // Ignore parse errors on logout
            }
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}