package com.soes.nex.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.Result;

@Repository
public interface ResultRepository extends JpaRepository<Result, Integer> { 
    List<Result> findByStudentId(Integer studentId);
    List<Result> findByExamId(Integer examId);
    Optional<Result> findByExamIdAndStudentId(Integer examId, Integer studentId);
}