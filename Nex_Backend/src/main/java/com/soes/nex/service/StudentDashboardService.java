package com.soes.nex.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.soes.nex.dto.StudentDashboardData;

@Service
public class StudentDashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public StudentDashboardData getStudentDashboardData(Long studentId) {
        // 1. Fetch Student Name
        String nameSql = "SELECT username FROM users WHERE id = ?";
        String studentName = "Student";
        try {
            studentName = jdbcTemplate.queryForObject(nameSql, String.class, studentId);
        } catch (Exception e) {
            studentName = "Student";
        }

        // 2. Fetch Enrolled Courses
        String coursesSql = "SELECT c.id, c.course_name, c.created_by FROM course c " +
                            "JOIN student s ON c.id = s.course_id WHERE s.user_id = ?";
        List<StudentDashboardData.CourseDTO> courses = new ArrayList<>();
        try {
            courses = jdbcTemplate.query(coursesSql, new Object[]{studentId}, (rs, rowNum) -> 
                new StudentDashboardData.CourseDTO(
                    rs.getString("course_name"),
                    "Instructor", // Default or fetch teacher name
                    80,
                    rs.getInt("id")
                )
            );
        } catch (Exception e) {
             System.out.println("Error fetching courses: " + e.getMessage());
        }

        // Fetch Exam List for the student's course (To be sent in future if needed, but dashboard just needs courses & grades)
        String gradesSql = "SELECT score FROM exam_results WHERE username = ? ORDER BY submitted_at DESC LIMIT 3";
        List<StudentDashboardData.GradeDTO> grades = new ArrayList<>();
        List<Double> scores = new ArrayList<>();
        try {
            String usernameSql = "SELECT username FROM users WHERE id = ?";
            String un = jdbcTemplate.queryForObject(usernameSql, String.class, studentId);
            scores = jdbcTemplate.queryForList(gradesSql, Double.class, un);
            int idx = 1;
            for (Double score : scores) {
                grades.add(new StudentDashboardData.GradeDTO("Quiz " + idx, score + " / 100"));
                idx++;
            }
        } catch (Exception e) {
            // Default mock grades if empty
            grades.add(new StudentDashboardData.GradeDTO("Quiz 2 - Data Structures", "A (94%)"));
            grades.add(new StudentDashboardData.GradeDTO("Midterm - Algorithms", "B+ (88%)"));
        }

        double avgScore = 0.0;
        if (!scores.isEmpty()) {
            double sum = 0;
            for (Double s : scores) { sum += s; }
            avgScore = Math.round((sum / scores.size()) * 10.0) / 10.0;
        } else {
            avgScore = 85.5; // Mock fallback
        }

        String courseName = "Enrolled Courses";
        if (!courses.isEmpty()) {
            courseName = courses.get(0).getCourseName();
        }

        return new StudentDashboardData(
            studentName,
            avgScore,
            courseName,
            65, // Overall progress mock
            courses,
            grades
        );
    }
}