package com.soes.nex.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE (n.recipientUsername = :username OR n.role = :role OR n.role = 'ALL' OR (n.recipientUsername IS NULL AND n.role = :role)) ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(@Param("username") String username, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipientUsername = :username OR n.role = :role OR n.role = 'ALL' OR (n.recipientUsername IS NULL AND n.role = :role)) AND n.isRead = false")
    long countUnreadForUser(@Param("username") String username, @Param("role") String role);

    List<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);

    List<Notification> findByRoleOrderByCreatedAtDesc(String role);
}
