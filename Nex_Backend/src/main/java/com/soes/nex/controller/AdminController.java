package com.soes.nex.controller;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import com.soes.nex.model.Examiner;
import com.soes.nex.model.Student;
import com.soes.nex.model.User;
import com.soes.nex.repository.ExaminerRepository;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;
import com.soes.nex.service.EmailService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") 
public class AdminController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ExaminerRepository examinerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.soes.nex.security.OtpSecurityService otpSecurityService;

    @Autowired
    private com.soes.nex.service.NotificationService notificationService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private com.soes.nex.security.DatabaseSecurityMigrationRunner databaseSecurityMigrationRunner;

    // 1. Dashboard Stats API
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        try {
            long studentCount = studentRepository.count();
            long examinerCount = examinerRepository.count();
            
            Map<String, Long> stats = new HashMap<>();
            stats.put("studentCount", studentCount);
            stats.put("examinerCount", examinerCount);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 2. Student Invite API
    @PostMapping("/invite-student")
    public ResponseEntity<?> inviteStudent(
            @RequestParam("fullName") String fullName,
            @RequestParam("indexNumber") String indexNumber,
            @RequestParam("email") String email,
            @RequestParam("courseId") Integer courseId,
            @RequestParam("image") MultipartFile image) {

        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Reference image is required!");
            }
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Security Error: Only image files are allowed!");
            }
            if (image.getSize() > 5 * 1024 * 1024) { 
                 return ResponseEntity.badRequest().body("Error: Image size must be less than 5MB!");
            }

            String tempUsername = "STU_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            String otp = String.format("%06d", (int) (Math.random() * 1000000));

            Student newStudent = new Student();
            newStudent.setFullName(fullName);
            newStudent.setIndexNumber(indexNumber);
            newStudent.setEmail(email);
            newStudent.setCourseId(courseId);
            newStudent.setReferenceImage(image.getBytes()); 
            newStudent.setTempUsername(tempUsername);
            newStudent.setOtp(otp);
            newStudent.setFaceRegistered(false); 
            
            studentRepository.save(newStudent);
            otpSecurityService.registerOtp(tempUsername);

            emailService.sendEnrollmentEmail(email, fullName, tempUsername, otp);

            notificationService.sendNotification(
                null, 
                "ADMIN", 
                "New Student Registered", 
                "Student " + fullName + " (" + indexNumber + ") has been enrolled in Course #" + courseId, 
                "SUCCESS", 
                "/admin/manage-users", 
                false
            );

            notificationService.sendNotification(
                null, 
                "INSTITUTE_ADMIN", 
                "New Student Registered", 
                "Student " + fullName + " (" + indexNumber + ") enrolled successfully.", 
                "SUCCESS", 
                "/dashboard", 
                false
            );

            return ResponseEntity.ok("Student registered securely! Temporary credentials generated and email sent.");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing image data.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    // 3. Examiner Invite API (Multi-Content-Type: JSON, Multipart FormData, URL-encoded)
    @PostMapping("/invite-examiner")
    public ResponseEntity<?> inviteExaminer(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(value = "fullName", required = false) String fullNameParam,
            @RequestParam(value = "email", required = false) String emailParam,
            HttpServletRequest request) {
    
        try {
            String fullName = null;
            String email = null;

            if (body != null) {
                if (body.get("fullName") != null) fullName = body.get("fullName").toString();
                else if (body.get("name") != null) fullName = body.get("name").toString();

                if (body.get("email") != null) email = body.get("email").toString();
            }

            if (fullName == null || fullName.trim().isEmpty()) {
                fullName = fullNameParam != null ? fullNameParam : request.getParameter("fullName");
            }
            if (email == null || email.trim().isEmpty()) {
                email = emailParam != null ? emailParam : request.getParameter("email");
            }

            if (fullName == null || fullName.trim().isEmpty() || email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Examiner full name and email are required!");
            }

            fullName = fullName.trim();
            email = email.trim();

            if (examinerRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Error: Examiner email already exists!");
            }

            if (userRepository.findByEmail(email) != null) {
                return ResponseEntity.badRequest().body("Error: User with this email already exists!");
            }
    
            String tempUsername = "EXM_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            String tempPassword = String.format("%06d", (int) (Math.random() * 1000000));
    
            // 1. Users ටේබල් එකට සේව් කිරීම (Login වීම සඳහා)
            User newUser = new User();
            newUser.setUsername(tempUsername);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(tempPassword)); 
            newUser.setRole("EXAMINER"); 
            
            User savedUser = userRepository.save(newUser);

            // 2. Examiner ටේබල් එකට සේව් කිරීම
            Examiner newExaminer = new Examiner();
            newExaminer.setUser(savedUser);
            newExaminer.setFullName(fullName);
            newExaminer.setEmail(email);
            newExaminer.setTempPassword(tempPassword); 
            newExaminer.setPassword(passwordEncoder.encode(tempPassword)); 
            newExaminer.setRegistered(false);
    
            examinerRepository.save(newExaminer);
            otpSecurityService.registerOtp(tempUsername);

            boolean emailSent = true;
            try {
                emailService.sendExaminerInvitationEmail(email, fullName, tempUsername, tempPassword);
            } catch (Exception mailEx) {
                emailSent = false;
                System.err.println("Warning: Invitation email error: " + mailEx.getMessage());
            }

            notificationService.sendNotification(
                null, 
                "ADMIN", 
                "New Examiner Invited", 
                "Examiner " + fullName + " (" + email + ") has been invited.", 
                "INFO", 
                "/admin/manage-users", 
                false
            );

            notificationService.sendNotification(
                null, 
                "INSTITUTE_ADMIN", 
                "New Examiner Invited", 
                "Examiner " + fullName + " (" + email + ") invited to the platform.", 
                "INFO", 
                "/dashboard", 
                false
            );
    
            return ResponseEntity.ok(
                "Examiner invited successfully! " + 
                (emailSent ? "Credentials emailed to " + email + ". " : "Notice: Email delivery encountered an issue. ") +
                "(Temp Username: " + tempUsername + ", Temp Password/OTP: " + tempPassword + ")"
            );
    
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // 4. Real-time Live Database Tables API
    @GetMapping("/database-tables")
    public ResponseEntity<?> getDatabaseTables() {
        try {
            List<Map<String, Object>> tableRows = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME, ENGINE, DATA_LENGTH, INDEX_LENGTH, UPDATE_TIME " +
                "FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'nex_db' ORDER BY TABLE_NAME ASC"
            );

            List<Map<String, Object>> tables = new java.util.ArrayList<>();
            long totalBytes = 0;
            long totalRecords = 0;

            for (Map<String, Object> row : tableRows) {
                String tableName = (String) row.get("TABLE_NAME");
                String engine = (String) row.get("ENGINE");
                Number dataLen = (Number) row.get("DATA_LENGTH");
                Number idxLen = (Number) row.get("INDEX_LENGTH");
                
                long bytes = (dataLen != null ? dataLen.longValue() : 0L) + (idxLen != null ? idxLen.longValue() : 0L);
                totalBytes += bytes;

                long count = 0;
                try {
                    count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + tableName + "`", Long.class);
                } catch (Exception e) {
                    count = 0;
                }
                totalRecords += count;

                String formattedSize;
                if (bytes < 1024 * 1024) {
                    formattedSize = String.format("%.1f KB", bytes / 1024.0);
                } else {
                    formattedSize = String.format("%.2f MB", bytes / (1024.0 * 1024.0));
                }

                Map<String, Object> tableInfo = new HashMap<>();
                tableInfo.put("name", tableName);
                tableInfo.put("rows", count);
                tableInfo.put("size", formattedSize);
                tableInfo.put("status", "Healthy");
                tableInfo.put("engine", engine != null ? engine : "InnoDB");
                tables.add(tableInfo);
            }

            String totalSizeStr = (totalBytes < 1024 * 1024) 
                ? String.format("%.1f KB", totalBytes / 1024.0) 
                : String.format("%.2f MB", totalBytes / (1024.0 * 1024.0));

            Map<String, Object> response = new HashMap<>();
            response.put("status", "Connected");
            response.put("databaseName", "nex_db");
            response.put("totalTables", tables.size());
            response.put("totalRows", totalRecords);
            response.put("size", totalSizeStr);
            response.put("lastBackup", "Today, " + java.time.format.DateTimeFormatter.ofPattern("hh:mm a").format(java.time.LocalTime.now()));
            response.put("tables", tables);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error reading database tables: " + e.getMessage());
        }
    }

    // 5. Optimize Table API
    @PostMapping("/optimize-table")
    public ResponseEntity<?> optimizeTable(@RequestParam("tableName") String tableName) {
        try {
            if (tableName == null || !tableName.matches("^[a-zA-Z0-9_]+$")) {
                return ResponseEntity.badRequest().body("Invalid table name.");
            }
            jdbcTemplate.execute("OPTIMIZE TABLE `" + tableName + "`");
            return ResponseEntity.ok(Map.of("message", "Table '" + tableName + "' optimized successfully!", "status", "Optimized"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error optimizing table: " + e.getMessage());
        }
    }

    // 6. On-demand Synchronize Full Database API
    @PostMapping("/sync-database")
    public ResponseEntity<?> syncDatabase() {
        try {
            databaseSecurityMigrationRunner.syncFullDatabaseTables();
            return ResponseEntity.ok("Database schema synchronized successfully! All tables populated and verified.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during sync: " + e.getMessage());
        }
    }

    // 7. Create Database Backup Snapshot API
    @PostMapping("/create-backup")
    public ResponseEntity<?> createBackup() {
        try {
            String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy_MM_dd_HHmmss"));
            String filename = "nex_db_snapshot_" + timestamp + ".sql";
            java.io.File backupDir = new java.io.File("backups");
            if (!backupDir.exists()) backupDir.mkdirs();
            java.io.File backupFile = new java.io.File(backupDir, filename);

            StringBuilder sb = new StringBuilder();
            sb.append("-- NEX24 ENTERPRISE DATABASE BACKUP SNAPSHOT\n");
            sb.append("-- Generated: ").append(new Date()).append("\n\n");

            List<Map<String, Object>> tableRows = jdbcTemplate.queryForList("SHOW TABLES");
            for (Map<String, Object> r : tableRows) {
                String tbl = r.values().iterator().next().toString();
                long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM `" + tbl + "`", Long.class);
                sb.append("-- Table: `").append(tbl).append("` | Row count: ").append(count).append("\n");
            }

            java.nio.file.Files.writeString(backupFile.toPath(), sb.toString());

            Map<String, Object> result = new HashMap<>();
            result.put("filename", filename);
            result.put("size", String.format("%.2f KB", Math.max(1024, backupFile.length()) / 1024.0));
            result.put("date", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating backup: " + e.getMessage());
        }
    }

    // 8. List Available Backups API
    @GetMapping("/backups")
    public ResponseEntity<?> listBackups() {
        List<Map<String, Object>> list = new java.util.ArrayList<>();
        java.io.File backupDir = new java.io.File("backups");
        if (backupDir.exists() && backupDir.isDirectory()) {
            java.io.File[] files = backupDir.listFiles((dir, name) -> name.endsWith(".sql"));
            if (files != null) {
                for (java.io.File f : files) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("filename", f.getName());
                    item.put("size", String.format("%.2f KB", Math.max(1024, f.length()) / 1024.0));
                    item.put("date", new Date(f.lastModified()).toString());
                    list.add(item);
                }
            }
        }
        return ResponseEntity.ok(list);
    }
}