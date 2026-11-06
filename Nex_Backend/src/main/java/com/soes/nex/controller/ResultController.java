package com.soes.nex.controller;

import com.soes.nex.model.ExamAttempt;
import com.soes.nex.model.Student;
import com.soes.nex.model.User;
import com.soes.nex.repository.ExamAttemptRepository;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    @Autowired
    private ExamAttemptRepository attemptRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    // Secured with BOLA / IDOR Defense: Students can only view their own results
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentResults(
            @PathVariable Integer studentId,
            Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String callerName = principal.getName();
        User caller = userRepository.findByUsername(callerName);
        if (caller == null) {
            caller = userRepository.findByEmail(callerName);
        }

        if (caller != null) {
            String role = caller.getRole();
            // Admins and Examiners can view results
            boolean isStaff = "ADMIN".equalsIgnoreCase(role) || "INSTITUTE_ADMIN".equalsIgnoreCase(role) || "EXAMINER".equalsIgnoreCase(role);
            
            if (!isStaff) {
                // If caller is student, verify studentId ownership
                Optional<Student> studentOpt = studentRepository.findById(studentId);
                if (studentOpt.isEmpty() || studentOpt.get().getUser() == null || 
                    !studentOpt.get().getUser().getId().equals(caller.getId())) {
                    return ResponseEntity.status(403).body("Forbidden: IDOR attack blocked. You can only view your own results.");
                }
            }
        }

        List<ExamAttempt> attempts = attemptRepository.findByStudentId(studentId);
        return ResponseEntity.ok(attempts);
    }

    @Autowired
    private com.soes.nex.repository.ExamResultRepository examResultRepository;

    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String caller = principal.getName();
        return ResponseEntity.ok(examResultRepository.findByUsername(caller));
    }
}