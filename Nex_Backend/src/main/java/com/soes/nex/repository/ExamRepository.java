package com.soes.nex.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Integer> {
    
    // මේ method එක අලුතින් එකතු කරන්න
    List<Exam> findByCourseId(Integer courseId);

}