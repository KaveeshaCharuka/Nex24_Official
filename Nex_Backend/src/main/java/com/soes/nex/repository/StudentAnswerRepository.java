package com.soes.nex.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.StudentAnswer;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Integer> { 
    List<StudentAnswer> findByAttemptId(Integer attemptId);
    List<StudentAnswer> findByAttemptIdAndQuestionId(Integer attemptId, Integer questionId);
}