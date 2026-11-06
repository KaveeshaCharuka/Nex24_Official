package com.soes.nex.dto;

import java.util.List;

public class StudentDashboardData {
    private String studentName;
    private double gpa;
    private String degreeProgram;
    private int programCompletionPercentage;
    private List<CourseDTO> courses;
    private List<GradeDTO> recentGrades;

    public StudentDashboardData() {}

    public StudentDashboardData(String studentName, double gpa, String degreeProgram, int programCompletionPercentage, List<CourseDTO> courses, List<GradeDTO> recentGrades) {
        this.studentName = studentName;
        this.gpa = gpa;
        this.degreeProgram = degreeProgram;
        this.programCompletionPercentage = programCompletionPercentage;
        this.courses = courses;
        this.recentGrades = recentGrades;
    }

    // Getters & Setters
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public double getGpa() { return gpa; }
    public void setGpa(double gpa) { this.gpa = gpa; }

    public String getDegreeProgram() { return degreeProgram; }
    public void setDegreeProgram(String degreeProgram) { this.degreeProgram = degreeProgram; }

    public int getProgramCompletionPercentage() { return programCompletionPercentage; }
    public void setProgramCompletionPercentage(int programCompletionPercentage) { this.programCompletionPercentage = programCompletionPercentage; }

    public List<CourseDTO> getCourses() { return courses; }
    public void setCourses(List<CourseDTO> courses) { this.courses = courses; }

    public List<GradeDTO> getRecentGrades() { return recentGrades; }
    public void setRecentGrades(List<GradeDTO> recentGrades) { this.recentGrades = recentGrades; }

    // Inner DTO Classes
    public static class CourseDTO {
        private String courseName;
        private String instructor;
        private int progress;
        private Integer courseId;

        public CourseDTO(String courseName, String instructor, int progress) {
            this.courseName = courseName;
            this.instructor = instructor;
            this.progress = progress;
            this.courseId = null;
        }

        public CourseDTO(String courseName, String instructor, int progress, Integer courseId) {
            this.courseName = courseName;
            this.instructor = instructor;
            this.progress = progress;
            this.courseId = courseId;
        }

        // Getters
        public String getCourseName() { return courseName; }
        public String getInstructor() { return instructor; }
        public int getProgress() { return progress; }
        public Integer getCourseId() { return courseId; }
    }



    public static class GradeDTO {
        private String title;
        private String grade;

        public GradeDTO(String title, String grade) {
            this.title = title;
            this.grade = grade;
        }

        public String getTitle() { return title; }
        public String getGrade() { return grade; }
    }
}