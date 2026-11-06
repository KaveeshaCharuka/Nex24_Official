package com.soes.nex.dto;

import org.springframework.web.multipart.MultipartFile;

public class StudentRegistrationDTO {
    private String name;
    private String email;
    private String studentId;
    private MultipartFile photo;

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public MultipartFile getPhoto() { return photo; }
    public void setPhoto(MultipartFile photo) { this.photo = photo; }
}