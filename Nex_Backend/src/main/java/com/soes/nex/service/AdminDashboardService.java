package com.soes.nex.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.soes.nex.dto.AdminDashboardData;

@Service
public class AdminDashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public AdminDashboardData getDashboardData() {
        // 1. Total Students Count
        String studentsSql = "SELECT COUNT(*) FROM users WHERE role = 'STUDENT'";
        Long totalStudents = jdbcTemplate.queryForObject(studentsSql, Long.class);

        // 2. Face Profiles Registered Count
        String faceProfilesSql = "SELECT COUNT(*) FROM student WHERE is_face_registered = TRUE";
        Long faceProfiles = jdbcTemplate.queryForObject(faceProfilesSql, Long.class);

        // 3. System Users List
        String usersSql = "SELECT id, username, email, role FROM users LIMIT 10";
        List<AdminDashboardData.UserDTO> usersList = jdbcTemplate.query(usersSql, (rs, rowNum) ->
            new AdminDashboardData.UserDTO(
                rs.getLong("id"),
                rs.getString("username"),
                rs.getString("email"),
                rs.getString("role"),
                "Active"
            )
        );

        // 4. Pending Examiners (Users with EXAMINER role needing approval)
        String pendingSql = "SELECT id, username, email FROM users WHERE role = 'EXAMINER' LIMIT 5";
        List<AdminDashboardData.ExaminerDTO> pendingExaminers = jdbcTemplate.query(pendingSql, (rs, rowNum) ->
            new AdminDashboardData.ExaminerDTO(
                rs.getLong("id"),
                rs.getString("username"),
                rs.getString("email"),
                "Computing"
            )
        );

        return new AdminDashboardData(
            totalStudents != null ? totalStudents : 0,
            faceProfiles != null ? faceProfiles : 0,
            "HEALTHY",
            pendingExaminers.size(),
            pendingExaminers,
            usersList
        );
    }
}