package com.soes.nex.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.soes.nex.model.Notification;
import com.soes.nex.model.User;
import com.soes.nex.repository.NotificationRepository;
import com.soes.nex.repository.UserRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Dispatch notification to user and/or role, and optionally send branded email.
     */
    public Notification sendNotification(String recipientUsername, String role, String title, String message, String type, String actionUrl, boolean sendEmail) {
        Notification notification = new Notification(recipientUsername, role, title, message, type, actionUrl);
        Notification saved = notificationRepository.save(notification);

        if (sendEmail) {
            try {
                if (recipientUsername != null && !recipientUsername.trim().isEmpty()) {
                    User user = userRepository.findByUsername(recipientUsername);
                    if (user != null && user.getEmail() != null) {
                        emailService.sendNotificationEmail(user.getEmail(), user.getUsername(), title, message, type);
                    }
                } else if (role != null) {
                    List<User> users = userRepository.findByRole(role);
                    if (users != null) {
                        for (User u : users) {
                            if (u.getEmail() != null) {
                                emailService.sendNotificationEmail(u.getEmail(), u.getUsername(), title, message, type);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Notification email delivery exception: " + e.getMessage());
            }
        }

        return saved;
    }

    public List<Notification> getNotificationsForUser(String username, String role) {
        return notificationRepository.findNotificationsForUser(username, role);
    }

    public long getUnreadCount(String username, String role) {
        return notificationRepository.countUnreadForUser(username, role);
    }

    public boolean markAsRead(Long id) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setRead(true);
            notificationRepository.save(n);
            return true;
        }
        return false;
    }

    public void markAllAsRead(String username, String role) {
        List<Notification> list = notificationRepository.findNotificationsForUser(username, role);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(list);
    }
}
