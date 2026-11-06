package com.soes.nex.service;

import java.util.Base64;
import java.util.Optional;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.soes.nex.dto.LoginRequest;
import com.soes.nex.dto.RegisterRequest;
import com.soes.nex.model.Student;
import com.soes.nex.model.User;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;
import com.soes.nex.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. Student Register
    public String registerStudent(RegisterRequest request) {
        User existingUser = userRepository.findByUsername(request.getUsername());
        if (existingUser != null) {
            return "Error: Username already exists!";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        if (request.getRole().equals("STUDENT")) {
            Student student = new Student();
            student.setUser(user);
            studentRepository.save(student);
        }

        return "User Registered Successfully!";
    }

    // 2. Login
    public String login(LoginRequest request) {
        try {
            User user = userRepository.findByUsername(request.getUsername());
            if (user == null) {
                user = userRepository.findByEmail(request.getUsername());
            }

            if (user == null) {
                return "Invalid Credentials";
            }

            boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());

            if (!passwordMatches) {
                return "Invalid Credentials";
            }

            String identifier = (user.getUsername() != null && !user.getUsername().isEmpty())
                    ? user.getUsername()
                    : user.getEmail();

            return jwtUtil.generateToken(identifier);

        } catch (Exception e) {
            return "Server Error: " + e.getMessage();
        }
    }

    // 3. Student Account Activation (Face Verification)
    public String activateStudentAccount(String tempUsername, String otp, String newUsername, String newPassword,
            String faceBase64) {
        User existingUser = userRepository.findByUsername(newUsername);
        if (existingUser != null) {
            return "Error: Username is already taken!";
        }

        Optional<Student> studentOpt = studentRepository.findByTempUsername(tempUsername);
        if (studentOpt.isEmpty()) {
            return "Error: Invalid activation token!";
        }

        Student student = studentOpt.get();

        if (!student.getOtp().equals(otp)) {
            return "Error: Invalid OTP!";
        }

        User newUser = new User();
        newUser.setUsername(newUsername);
        newUser.setPassword(passwordEncoder.encode(newPassword));
        newUser.setEmail(student.getEmail());
        newUser.setRole("STUDENT");

        userRepository.save(newUser);

        byte[] decodedFaceBytes = Base64.getDecoder().decode(faceBase64);

        student.setUser(newUser);
        student.setFaceIdData(decodedFaceBytes);
        student.setFaceRegistered(true);
        student.setTempUsername(null);
        student.setOtp(null);

        studentRepository.save(student);

        return "Account Activated Successfully!";
    }

    // 4. Examiner Account Setup
    public String setupExaminerAccount(String tempUsername, String otp, String newPassword) {
        User user = userRepository.findByUsername(tempUsername);

        if (user == null || !user.getRole().equals("EXAMINER")) {
            throw new RuntimeException("Invalid Examiner Username!");
        }

        boolean isOtpValid = passwordEncoder.matches(otp, user.getPassword());
        if (!isOtpValid) {
            throw new RuntimeException("Invalid OTP Code!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Account Setup Successful";
    }

    // 5. Institute Registration (Presentation Safe)
    public String registerInstitute(Map<String, String> request) {
        // Frontend එකෙන් "email" විදිහට එව්වත්, "officialEmail" විදිහට එව්වත් අල්ලගන්නවා!
        String email = request.get("email");
        if (email == null) email = request.get("officialEmail");

        // Admin නමත් ඒ විදිහටමයි
        String adminName = request.get("adminName");
        if (adminName == null) adminName = request.get("username");

        String password = request.get("password");

        if (userRepository.findByEmail(email) != null) {
            return "Error: Email is already registered!";
        }

        User user = new User();
        user.setUsername(adminName != null ? adminName : "Admin"); 
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("ADMIN"); 

        userRepository.save(user);

        return "Institute Registered Successfully!";
    }
}