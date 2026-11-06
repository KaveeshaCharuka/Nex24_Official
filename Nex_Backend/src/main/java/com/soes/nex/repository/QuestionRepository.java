package com.soes.nex.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByExamExamId(Integer examId);
}