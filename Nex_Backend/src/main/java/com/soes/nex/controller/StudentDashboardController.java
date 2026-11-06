package com.soes.nex.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.dto.StudentDashboardData;
import com.soes.nex.service.StudentDashboardService;

@RestController
@RequestMapping("/api/student/dashboard")
@CrossOrigin(origins = "*")
public class StudentDashboardController {

    @Autowired
    private com.soes.nex.service.StudentDashboardService studentDashboardService;

    @Autowired
    private com.soes.nex.repository.UserRepository userRepository;

    @GetMapping("/data")
    public ResponseEntity<?> getDashboardData(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        String username = principal.getName();
        Long studentId = 1L; 
        
        com.soes.nex.model.User user = userRepository.findByUsername(username);
        if (user == null) {
            user = userRepository.findByEmail(username);
        }
        if (user != null) {
            studentId = user.getId();
        }

        StudentDashboardData data = studentDashboardService.getStudentDashboardData(studentId);
        return ResponseEntity.ok(data);
    }
}