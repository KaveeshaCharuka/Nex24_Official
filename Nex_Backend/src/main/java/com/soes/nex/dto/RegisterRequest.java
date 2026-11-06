package com.soes.nex.dto;

public class RegisterRequest {
    
    // 💡 මේවා තමයි React එකෙන් හරියටම එන්නේ
    private String username;
    private String email;
    private String password;
    private String role; 

    // මේවා දැනට Frontend එකේ නැති නිසා null විදිහට සේව් වෙයි (අනාගතයේදී ඕන වුණොත් පාවිච්චි කරන්න පුළුවන්)
    private String fullName;
    private String indexNumber;
    private Integer courseId;

    // ==========================================
    // Getters and Setters
    // ==========================================

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getIndexNumber() { return indexNumber; }
    public void setIndexNumber(String indexNumber) { this.indexNumber = indexNumber; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }
}