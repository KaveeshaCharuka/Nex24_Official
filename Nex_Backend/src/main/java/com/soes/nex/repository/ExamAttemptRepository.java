package com.soes.nex.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.ExamAttempt;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Integer> { 
    List<ExamAttempt> findByStudentId(Integer studentId);
    List<ExamAttempt> findByExamId(Integer examId);
    List<ExamAttempt> findByExamIdAndStudentId(Integer examId, Integer studentId);
}