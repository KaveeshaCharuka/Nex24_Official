package com.soes.nex.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.soes.nex.dto.ExaminerDashboardStats;

@Service
public class ExaminerDashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public ExaminerDashboardStats getDashboardStats(Long examinerId) {
        // 1. Active Courses Count
        String activeCoursesSql = "SELECT COUNT(*) FROM course";
        Long activeCourses = 0L;
        try { activeCourses = jdbcTemplate.queryForObject(activeCoursesSql, Long.class); } catch (Exception e) {}

        // 2. Total Question Bank Size
        String questionBankSql = "SELECT COUNT(*) FROM questions";
        Long questionBankSize = 0L;
        try { questionBankSize = jdbcTemplate.queryForObject(questionBankSql, Long.class); } catch (Exception e) {}

        // 3. Papers To Grade (Just all exam_results)
        String papersToGradeSql = "SELECT COUNT(*) FROM exam_results";
        Long papersToGrade = 0L;
        try { papersToGrade = jdbcTemplate.queryForObject(papersToGradeSql, Long.class); } catch (Exception e) {}

        // 4. Upcoming Exams Count
        String upcomingExamsSql = "SELECT COUNT(*) FROM exam WHERE status = 'SCHEDULED'";
        Long upcomingExams = 0L;
        try { upcomingExams = jdbcTemplate.queryForObject(upcomingExamsSql, Long.class); } catch (Exception e) {}

        return new ExaminerDashboardStats(
            activeCourses != null ? activeCourses : 0,
            questionBankSize != null ? questionBankSize : 0,
            papersToGrade != null ? papersToGrade : 0,
            upcomingExams != null ? upcomingExams : 0
        );
    }
}