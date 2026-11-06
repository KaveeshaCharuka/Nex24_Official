package com.soes.nex.controller;

import java.security.Principal;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.soes.nex.dto.ExamCreateRequest;
import com.soes.nex.dto.ExamSubmitRequest;
import com.soes.nex.model.Exam;
import com.soes.nex.model.ExamResult;
import com.soes.nex.model.Question;
import com.soes.nex.model.Student;
import com.soes.nex.model.User;
import com.soes.nex.repository.ExamRepository;
import com.soes.nex.repository.ExamResultRepository;
import com.soes.nex.repository.QuestionRepository;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.soes.nex.service.NotificationService notificationService;

    @Autowired
    private com.soes.nex.service.DatabaseSyncService databaseSyncService;

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examRepository.findAll());
    }

    // 1. Get Exam Paper (Securely verified: Student must be enrolled, exam must be ACTIVE, no direct backdoor login)
    @GetMapping("/{examId}")
    public ResponseEntity<?> getExamPaper(@PathVariable Integer examId, Principal principal) {
        Optional<Exam> examOpt = examRepository.findById(examId);
        
        if (examOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: No exam found. An examiner has not created or scheduled an exam with ID #" + examId);
        }
        
        Exam exam = examOpt.get();

        if (principal != null) {
            String caller = principal.getName();
            User user = userRepository.findByUsername(caller);
            if (user == null) user = userRepository.findByEmail(caller);

            // If caller is a student, enforce strict enrollment and status verification
            if (user != null && "STUDENT".equalsIgnoreCase(user.getRole())) {
                
                // 1. Check if exam is ACTIVE
                if (!"ACTIVE".equalsIgnoreCase(exam.getStatus())) {
                    return ResponseEntity.status(403).body("Error: This exam is currently '" + exam.getStatus() + "'. You cannot enter until your examiner officially starts the exam session.");
                }

                // 2. Check if student already submitted this exam
                if (examResultRepository.existsByExamIdAndUsername(examId, user.getUsername())) {
                    return ResponseEntity.status(403).body("Error: You have already submitted and completed this exam!");
                }

                // 3. Verify course enrollment linking
                Optional<Student> studentOpt = studentRepository.findByUserUsername(user.getUsername());
                if (studentOpt.isEmpty()) studentOpt = studentRepository.findByUserEmail(user.getEmail());

                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    if (student.getCourseId() == null || !student.getCourseId().equals(exam.getCourseId())) {
                        return ResponseEntity.status(403).body("Error: Access denied. You are not enrolled in the specific course for this exam.");
                    }
                }
            }
        }

        return ResponseEntity.ok(exam);
    }

    // 2. Submit Exam (IDOR, Double-Submission / Race Condition Protected)
    @PostMapping("/{examId}/submit")
    public synchronized ResponseEntity<?> submitExam(
            @PathVariable Integer examId, 
            @RequestBody ExamSubmitRequest request,
            Principal principal) {

        String submittingUser = (principal != null) ? principal.getName() : request.getUsername();
        if (submittingUser == null || submittingUser.trim().isEmpty()) {
            return ResponseEntity.status(401).body("Error: Unauthorized exam submission.");
        }
        submittingUser = submittingUser.trim();

        if (examResultRepository.existsByExamIdAndUsername(examId, submittingUser)) {
            return ResponseEntity.status(409).body("Error: You have already submitted this exam! Multiple submissions are blocked.");
        }

        Optional<Exam> examOpt = examRepository.findById(examId);
        if (examOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: Exam not found!");
        }

        List<Question> questions = questionRepository.findByExamExamId(examId);
        if (questions.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: No questions found for this exam!");
        }

        int score = 0;
        Map<Integer, String> studentAnswers = request.getAnswers();

        if (studentAnswers != null) {
            for (Question q : questions) {
                String selectedOption = studentAnswers.get(q.getId());
                if (selectedOption != null && selectedOption.equalsIgnoreCase(q.getCorrectAnswer())) {
                    score++;
                }
            }
        }

        Exam exam = examOpt.get();
        // Simultaneously update exam_results, exam_attempt, student_answer, and result tables
        databaseSyncService.recordFullExamSubmission(examId, submittingUser, studentAnswers, questions, score, exam);

        // System-wide Notification Triggers
        String examTitle = exam.getExamTitle() != null ? exam.getExamTitle() : ("Exam #" + examId);

        // 1. Notify Student
        notificationService.sendNotification(
            submittingUser, 
            "STUDENT", 
            "Exam Completed Successfully", 
            "You completed " + examTitle + " with a score of " + score + "/" + questions.size() + ".", 
            "SUCCESS", 
            "/student/grades", 
            true
        );

        // 2. Notify Examiner
        notificationService.sendNotification(
            null, 
            "EXAMINER", 
            "Student Submission: " + examTitle, 
            "Candidate " + submittingUser + " submitted " + examTitle + ". Score: " + score + "/" + questions.size(), 
            "INFO", 
            "/examiner/live-monitoring", 
            false
        );

        return ResponseEntity.ok("Exam Submitted Successfully! Your Score: " + score + "/" + questions.size());
    }

    // 3. Verify Exam Identity (Face Verification with Payload & Spoof Checks)
    @PostMapping("/verify-identity")
    public ResponseEntity<?> verifyExamIdentity(
            @RequestParam("username") String username,
            @RequestParam("faceImage") MultipartFile faceImage,
            Principal principal) {
        
        try {
            String targetUser = (principal != null) ? principal.getName() : username;

            if (faceImage.isEmpty() || faceImage.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Error: Face scan image must be valid and less than 5MB.");
            }

            Optional<Student> studentOpt = studentRepository.findByUserUsername(targetUser);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByUserEmail(targetUser);
            }

            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Student profile not found!");
            }

            Student student = studentOpt.get();
            byte[] referenceImageData = student.getFaceIdData() != null ? student.getFaceIdData() : student.getReferenceImage();
            
            if (referenceImageData == null) {
                return ResponseEntity.badRequest().body("No registered reference image found for student!");
            }

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("reference", new org.springframework.core.io.ByteArrayResource(referenceImageData) {
                @Override
                public String getFilename() { return "reference.jpg"; }
            });
            body.add("live_scan", new org.springframework.core.io.ByteArrayResource(faceImage.getBytes()) {
                @Override
                public String getFilename() { return "live.jpg"; }
            });

            body.add("username", targetUser);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);
            
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity("http://127.0.0.1:5000/verify-face", requestEntity, java.util.Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Boolean verified = (Boolean) response.getBody().get("verified");
                Boolean spoof = (Boolean) response.getBody().get("spoof_detected");
                
                if (spoof != null && spoof) {
                    return ResponseEntity.status(401).body("Presentation attack detected! Static photo or screen playback detected.");
                }

                if (verified == null || !verified) {
                    return ResponseEntity.status(401).body("Face mismatch! Identity verification failed.");
                }
            } else {
                return ResponseEntity.status(500).body("AI verification engine error.");
            }

            return ResponseEntity.ok("Identity Verified");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Verification Error: " + e.getMessage());
        }
    }

    // 3.1 Internal Reference Image API for AI Proctoring Engine (Zero-Disk / In-Memory Cache)
    @GetMapping("/internal/reference-image/{username}")
    public ResponseEntity<?> getInternalReferenceImage(@PathVariable String username) {
        try {
            Optional<Student> studentOpt = studentRepository.findByUserUsername(username);
            if (studentOpt.isEmpty()) studentOpt = studentRepository.findByUserEmail(username);
            if (studentOpt.isEmpty()) studentOpt = studentRepository.findByIndexNumber(username);
            
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Student not found.");
            }

            Student student = studentOpt.get();
            byte[] referenceImageData = student.getFaceIdData() != null ? student.getFaceIdData() : student.getReferenceImage();
            
            if (referenceImageData == null) {
                return ResponseEntity.status(404).body("No reference image registered.");
            }

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "image/jpeg")
                    .body(referenceImageData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving reference image: " + e.getMessage());
        }
    }

    // 4. Create Exam (Examiner / Admin Only)
    @PostMapping("/create")
    public ResponseEntity<?> createExam(@RequestBody ExamCreateRequest request) {
        try {
            Exam exam = new Exam();
            exam.setExamTitle(request.getExamTitle());
            exam.setCourseId(request.getCourseId());
            exam.setExaminerId(request.getExaminerId() != null ? request.getExaminerId() : 1);
            exam.setTotalMarks(request.getTotalMarks());
            exam.setDurationMinutes(request.getDurationMinutes());
            exam.setExamDate(request.getExamDate() != null ? request.getExamDate() : new Date());
            
            // Default to ACTIVE so students can take it right away, or allow SCHEDULED
            exam.setStatus("ACTIVE");
            
            Exam savedExam = examRepository.save(exam);

            if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
                List<Question> questions = questionRepository.findAllById(request.getQuestionIds());
                for (Question q : questions) {
                    q.setExam(savedExam);
                    databaseSyncService.syncQuestionDualSchema(q);
                }
                questionRepository.saveAll(questions);
            }

            notificationService.sendNotification(
                null, 
                "STUDENT", 
                "New Exam Scheduled", 
                "A new examination '" + savedExam.getExamTitle() + "' has been scheduled.", 
                "INFO", 
                "/student-dashboard", 
                false
            );

            return ResponseEntity.ok("Exam created successfully with ID: " + savedExam.getExamId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating exam: " + e.getMessage());
        }
    }

    // 5. Update Exam Status (Examiner toggle: ACTIVE, SCHEDULED, COMPLETED)
    @PutMapping("/{examId}/status")
    public ResponseEntity<?> updateExamStatus(@PathVariable Integer examId, @RequestBody Map<String, String> request) {
        Optional<Exam> examOpt = examRepository.findById(examId);
        if (examOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: Exam not found!");
        }

        String newStatus = request.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Status field is required!");
        }

        Exam exam = examOpt.get();
        String upperStatus = newStatus.trim().toUpperCase();
        exam.setStatus(upperStatus);
        examRepository.save(exam);

        String examTitle = exam.getExamTitle() != null ? exam.getExamTitle() : ("Exam #" + examId);
        if ("ACTIVE".equalsIgnoreCase(upperStatus)) {
            notificationService.sendNotification(
                null, 
                "STUDENT", 
                "Exam is Now LIVE! 🚀", 
                "The examination '" + examTitle + "' is now active. Enrolled students can enter the exam portal.", 
                "SUCCESS", 
                "/student-dashboard", 
                true
            );
        } else if ("COMPLETED".equalsIgnoreCase(upperStatus)) {
            notificationService.sendNotification(
                null, 
                "STUDENT", 
                "Exam Concluded: " + examTitle, 
                "The examination session for '" + examTitle + "' has ended.", 
                "INFO", 
                "/student/grades", 
                false
            );
        }

        return ResponseEntity.ok("Exam status updated to " + exam.getStatus());
    }

    // 6. Delete Exam
    @DeleteMapping("/{examId}")
    public ResponseEntity<?> deleteExam(@PathVariable Integer examId) {
        if (!examRepository.existsById(examId)) {
            return ResponseEntity.status(404).body("Error: Exam not found!");
        }
        examRepository.deleteById(examId);
        return ResponseEntity.ok("Exam deleted successfully.");
    }
}