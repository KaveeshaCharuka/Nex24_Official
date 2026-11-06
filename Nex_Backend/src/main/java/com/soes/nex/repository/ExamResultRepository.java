package com.soes.nex.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.ExamResult;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Integer> {
    List<ExamResult> findByUsername(String username);
    boolean existsByExamIdAndUsername(Integer examId, String username);
}