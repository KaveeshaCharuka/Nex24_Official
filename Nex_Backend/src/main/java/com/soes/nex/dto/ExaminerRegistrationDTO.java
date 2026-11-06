package com.soes.nex.dto;

public class ExaminerRegistrationDTO {
    private String name;
    private String email;
    private String department;
    private String assignedCourse;

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAssignedCourse() { return assignedCourse; }
    public void setAssignedCourse(String assignedCourse) { this.assignedCourse = assignedCourse; }
}