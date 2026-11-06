package com.soes.nex.controller;

import com.soes.nex.model.Examiner;
import com.soes.nex.model.Student;
import com.soes.nex.repository.ExaminerRepository;
import com.soes.nex.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class ActivationController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExaminerRepository examinerRepository;

    @Autowired
    private com.soes.nex.repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.soes.nex.service.DatabaseSyncService databaseSyncService;

    // Student Activation API
    @PostMapping("/activate-student")
    public ResponseEntity<?> activateStudent(
            @RequestParam("tempUsername") String tempUsername,
            @RequestParam("otp") String otp,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("faceImage") MultipartFile faceImage) {

        try {
            java.util.Optional<Student> studentOpt = studentRepository.findByTempUsername(tempUsername);
            if (studentOpt.isEmpty() || studentOpt.get().getOtp() == null || !studentOpt.get().getOtp().equals(otp.trim())) {
                return ResponseEntity.badRequest().body("Error: Invalid Temp Username or OTP!");
            }
            Student student = studentOpt.get();

            if (faceImage == null || faceImage.isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Face scan image is required!");
            }

            // 2. Python AI එකෙන් මුහුණ Verify කිරීම
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

                org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
                
                // Add Reference Image
                org.springframework.core.io.ByteArrayResource referenceResource = new org.springframework.core.io.ByteArrayResource(student.getReferenceImage()) {
                    @Override
                    public String getFilename() {
                        return "reference.jpg";
                    }
                };
                body.add("reference", referenceResource);

                // Add Live Scan Image
                org.springframework.core.io.ByteArrayResource liveScanResource = new org.springframework.core.io.ByteArrayResource(faceImage.getBytes()) {
                    @Override
                    public String getFilename() {
                        return "live_scan.jpg";
                    }
                };
                body.add("live_scan", liveScanResource);

                org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);
                
                org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity("http://127.0.0.1:5000/verify-face", requestEntity, java.util.Map.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Boolean verified = (Boolean) response.getBody().get("verified");
                    if (verified == null || !verified) {
                        return ResponseEntity.status(401).body("Error: Face verification failed! Identity mismatch.");
                    }
                } else {
                    return ResponseEntity.status(500).body("Error: AI server returned an invalid response.");
                }

            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Error communicating with AI server: " + e.getMessage());
            }

            // 3. මුහුණේ දත්ත (Byte Array එකක් විදිහට) Database එකට සේව් කිරීම
            student.setFaceIdData(faceImage.getBytes()); 
            databaseSyncService.syncFaceDataForStudent(student.getStudentId(), faceImage.getBytes()); 

            // 4. අලුත් පාස්වර්ඩ් එක සේව් කිරීම (User Entity එකක් හදලා save කිරීම)
            com.soes.nex.model.User newUser = new com.soes.nex.model.User();
            newUser.setEmail(student.getEmail());
            // Use indexNumber as username if available, otherwise email
            newUser.setUsername(student.getIndexNumber() != null ? student.getIndexNumber() : student.getEmail());
            newUser.setPassword(passwordEncoder.encode(newPassword));
            newUser.setRole("STUDENT");
            userRepository.save(newUser);

            student.setPassword(passwordEncoder.encode(newPassword));
            student.setUser(newUser);
            
            // 5. මුහුණේ දත්ත සහ Status අප්ඩේට් කිරීම
            student.setFaceRegistered(true);
            
            // 6. පරණ Temp දත්ත මකා දැමීම (ආරක්ෂාව සඳහා)
            student.setTempUsername(null);
            student.setOtp(null);

            studentRepository.save(student);

            return ResponseEntity.ok("Student Account Activated Successfully!");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing face image data.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // Examiner Activation API
    @PostMapping("/activate-examiner")
    public ResponseEntity<?> activateExaminer(
            @RequestParam("email") String email,
            @RequestParam("tempPassword") String tempPassword,
            @RequestParam("newPassword") String newPassword) {
        
        try {
            Examiner examiner = examinerRepository.findByEmail(email);
            if (examiner == null || examiner.getTempPassword() == null || !examiner.getTempPassword().equals(tempPassword.trim())) {
                return ResponseEntity.badRequest().body("Error: Invalid Email or Temporary Password!");
            }

            // BCrypt Encoded Password
            examiner.setPassword(passwordEncoder.encode(newPassword));
            examiner.setRegistered(true);

            // Update existing User Entity or create if not present
            com.soes.nex.model.User user = examiner.getUser();
            if (user == null) {
                user = userRepository.findByEmail(examiner.getEmail());
            }
            if (user == null) {
                user = new com.soes.nex.model.User();
                user.setEmail(examiner.getEmail());
                user.setUsername(examiner.getEmail());
                user.setRole("EXAMINER");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            examiner.setUser(user);
            examiner.setTempPassword(null);
            
            examinerRepository.save(examiner);

            return ResponseEntity.ok("Examiner Account Activated Successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}