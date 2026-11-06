package com.soes.nex.dto;

import java.util.List;

public class AdminDashboardData {
    private long totalStudents;
    private long faceProfilesTrained;
    private String databaseStatus;
    private long pendingApprovalsCount;
    private List<ExaminerDTO> pendingExaminers;
    private List<UserDTO> systemUsers;

    public AdminDashboardData() {}

    public AdminDashboardData(long totalStudents, long faceProfilesTrained, String databaseStatus, long pendingApprovalsCount, List<ExaminerDTO> pendingExaminers, List<UserDTO> systemUsers) {
        this.totalStudents = totalStudents;
        this.faceProfilesTrained = faceProfilesTrained;
        this.databaseStatus = databaseStatus;
        this.pendingApprovalsCount = pendingApprovalsCount;
        this.pendingExaminers = pendingExaminers;
        this.systemUsers = systemUsers;
    }

    // Getters & Setters
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getFaceProfilesTrained() { return faceProfilesTrained; }
    public void setFaceProfilesTrained(long faceProfilesTrained) { this.faceProfilesTrained = faceProfilesTrained; }

    public String getDatabaseStatus() { return databaseStatus; }
    public void setDatabaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; }

    public long getPendingApprovalsCount() { return pendingApprovalsCount; }
    public void setPendingApprovalsCount(long pendingApprovalsCount) { this.pendingApprovalsCount = pendingApprovalsCount; }

    public List<ExaminerDTO> getPendingExaminers() { return pendingExaminers; }
    public void setPendingExaminers(List<ExaminerDTO> pendingExaminers) { this.pendingExaminers = pendingExaminers; }

    public List<UserDTO> getSystemUsers() { return systemUsers; }
    public void setSystemUsers(List<UserDTO> systemUsers) { this.systemUsers = systemUsers; }

    // Nested DTO Classes
    public static class ExaminerDTO {
        private Long id;
        private String name;
        private String email;
        private String department;

        public ExaminerDTO(Long id, String name, String email, String department) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.department = department;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getDepartment() { return department; }
    }

    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String status;

        public UserDTO(Long id, String name, String email, String role, String status) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.status = status;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public String getStatus() { return status; }
    }
}