package com.soes.nex.controller;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.model.Notification;
import com.soes.nex.model.User;
import com.soes.nex.repository.UserRepository;
import com.soes.nex.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private String resolveUserRole(String username) {
        if (username == null) return "STUDENT";
        User user = userRepository.findByUsername(username);
        if (user != null && user.getRole() != null) {
            return user.getRole().toUpperCase();
        }
        return "STUDENT";
    }

    // 1. Get all notifications for logged-in user
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        String username = principal.getName();
        String role = resolveUserRole(username);
        List<Notification> list = notificationService.getNotificationsForUser(username, role);
        return ResponseEntity.ok(list);
    }

    // 2. Get unread notifications count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(Collections.singletonMap("unreadCount", 0L));
        }
        String username = principal.getName();
        String role = resolveUserRole(username);
        long count = notificationService.getUnreadCount(username, role);
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    // 3. Mark single notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id);
        if (success) {
            return ResponseEntity.ok("Notification marked as read.");
        }
        return ResponseEntity.notFound().build();
    }

    // 4. Mark all notifications as read for current user
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllNotificationsAsRead(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body("Unauthenticated");
        }
        String username = principal.getName();
        String role = resolveUserRole(username);
        notificationService.markAllAsRead(username, role);
        return ResponseEntity.ok("All notifications marked as read.");
    }

    // 5. Send notification endpoint (for Admin / Examiner / System triggers)
    @PostMapping("/send")
    public ResponseEntity<?> sendCustomNotification(@RequestBody Map<String, Object> payload) {
        String recipient = (String) payload.get("recipientUsername");
        String role = (String) payload.get("role");
        String title = (String) payload.get("title");
        String message = (String) payload.get("message");
        String type = (String) payload.getOrDefault("type", "INFO");
        String actionUrl = (String) payload.get("actionUrl");
        boolean sendEmail = Boolean.TRUE.equals(payload.get("sendEmail"));

        if (title == null || message == null) {
            return ResponseEntity.badRequest().body("Title and message are required.");
        }

        Notification n = notificationService.sendNotification(recipient, role, title, message, type, actionUrl, sendEmail);
        return ResponseEntity.ok(n);
    }
}
