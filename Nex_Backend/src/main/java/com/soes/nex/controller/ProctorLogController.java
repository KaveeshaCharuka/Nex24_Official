package com.soes.nex.controller;

import com.soes.nex.dto.ProctorLogRequest;
import com.soes.nex.model.ProctorLog;
import com.soes.nex.repository.ProctorLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ProctorLogController {

    private static final java.util.concurrent.ConcurrentHashMap<String, String> liveScreens = new java.util.concurrent.ConcurrentHashMap<>();
    private static final java.util.concurrent.ConcurrentHashMap<String, String> liveCams = new java.util.concurrent.ConcurrentHashMap<>();
    private static final int MAX_BASE64_LENGTH = 7 * 1024 * 1024; // 7MB max to prevent memory overload

    @PostMapping("/live-stream/{username}")
    public ResponseEntity<?> pushLiveStream(
            @PathVariable String username, 
            @RequestBody java.util.Map<String, String> payload,
            Principal principal) {
        
        // IDOR Defense: Only allow the logged-in user to push their own stream
        if (principal == null || !principal.getName().equalsIgnoreCase(username)) {
            return ResponseEntity.status(403).body("Forbidden: Cannot push stream for another user.");
        }

        // Payload Overload Defense
        if (payload.containsKey("screenBase64")) {
            String screen = payload.get("screenBase64");
            if (screen != null && screen.length() < MAX_BASE64_LENGTH) {
                liveScreens.put(username, screen);
            }
        }
        if (payload.containsKey("camBase64")) {
            String cam = payload.get("camBase64");
            if (cam != null && cam.length() < MAX_BASE64_LENGTH) {
                liveCams.put(username, cam);
            }
        }
        return ResponseEntity.ok("Received");
    }

    @GetMapping("/live-stream/{username}")
    public ResponseEntity<?> getLiveStream(@PathVariable String username) {
        java.util.Map<String, String> data = new java.util.HashMap<>();
        data.put("screenBase64", liveScreens.getOrDefault(username, ""));
        data.put("camBase64", liveCams.getOrDefault(username, ""));
        return ResponseEntity.ok(data);
    }

    @Autowired
    private ProctorLogRepository proctorLogRepository;

    @Autowired
    private com.soes.nex.service.NotificationService notificationService;

    @PostMapping("/{examId}/log")
    public ResponseEntity<?> logProctorEvent(
            @PathVariable Integer examId,
            @RequestBody ProctorLogRequest request,
            Principal principal) {
        
        try {
            // IDOR Defense: Ensure log belongs to caller if user is student
            String targetUser = request.getUsername();
            if (principal != null && targetUser != null && !principal.getName().equalsIgnoreCase(targetUser)) {
                // If caller is student, prevent spoofing other students' logs
                targetUser = principal.getName();
            }

            ProctorLog log = new ProctorLog(examId, targetUser != null ? targetUser : "Student", request.getSeverity(), request.getIssueDetails());
            proctorLogRepository.save(log);

            // Trigger notification for Examiner and Student if severity is ALERT
            if ("ALERT".equalsIgnoreCase(request.getSeverity())) {
                notificationService.sendNotification(
                    null, 
                    "EXAMINER", 
                    "🚨 Proctor Flag Detected", 
                    "Suspicious activity for candidate " + targetUser + " in Exam #" + examId + ": " + request.getIssueDetails(), 
                    "ALERT", 
                    "/examiner/live-monitoring", 
                    false
                );

                notificationService.sendNotification(
                    targetUser, 
                    "STUDENT", 
                    "⚠️ Proctor Integrity Warning", 
                    "A potential violation was flagged during your exam: " + request.getIssueDetails(), 
                    "WARNING", 
                    null, 
                    false
                );
            }

            return ResponseEntity.ok("Proctor log saved successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving proctor log: " + e.getMessage());
        }
    }

    @GetMapping("/{examId}/logs")
    public ResponseEntity<?> getProctorLogs(
            @PathVariable Integer examId,
            @RequestParam("username") String username) {
        
        try {
            return ResponseEntity.ok(proctorLogRepository.findByExamIdAndUsername(examId, username));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching proctor logs: " + e.getMessage());
        }
    }

    @GetMapping("/live-sessions")
    public ResponseEntity<?> getLiveSessions() {
        try {
            java.util.List<ProctorLog> allLogs = proctorLogRepository.findAllByOrderByTimestampDesc();
            java.util.Map<String, java.util.Map<String, Object>> activeStudents = new java.util.HashMap<>();
            
            for (ProctorLog log : allLogs) {
                String key = log.getUsername() + "-" + log.getExamId();
                if (!activeStudents.containsKey(key)) {
                    java.util.Map<String, Object> data = new java.util.HashMap<>();
                    data.put("id", key);
                    data.put("name", log.getUsername());
                    data.put("index", log.getUsername()); 
                    data.put("examId", log.getExamId());
                    data.put("exam", "Exam #" + log.getExamId());
                    data.put("timeLeft", "Live");
                    data.put("status", "Normal");
                    data.put("flags", 0);
                    data.put("impersonationDetected", false);
                    activeStudents.put(key, data);
                }
                
                java.util.Map<String, Object> data = activeStudents.get(key);
                if (log.getIssueDetails() != null && log.getIssueDetails().toLowerCase().contains("impersonation")) {
                    data.put("impersonationDetected", true);
                    data.put("status", "Impersonation Alert");
                }

                if ("ALERT".equalsIgnoreCase(log.getSeverity())) {
                    int flags = (int) data.get("flags") + 1;
                    data.put("flags", flags);
                    if (!"Impersonation Alert".equals(data.get("status"))) {
                        if (flags > 3) data.put("status", "Critical");
                        else data.put("status", "Warning");
                    }
                }
            }
            return ResponseEntity.ok(activeStudents.values());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching live sessions: " + e.getMessage());
        }
    }
}
