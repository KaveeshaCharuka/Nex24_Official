package com.soes.nex.model;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "proctor_logs")
public class ProctorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false)
    private Integer examId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "severity", nullable = false)
    private String severity; // INFO, WARNING, ALERT

    @Column(name = "issue_details", columnDefinition = "TEXT")
    private String issueDetails;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private Timestamp timestamp;

    public ProctorLog() {
    }

    public ProctorLog(Integer examId, String username, String severity, String issueDetails) {
        this.examId = examId;
        this.username = username;
        this.severity = severity;
        this.issueDetails = issueDetails;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getExamId() {
        return examId;
    }

    public void setExamId(Integer examId) {
        this.examId = examId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getIssueDetails() {
        return issueDetails;
    }

    public void setIssueDetails(String issueDetails) {
        this.issueDetails = issueDetails;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }
}
