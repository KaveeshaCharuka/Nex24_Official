package com.soes.nex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.Examiner;

@Repository
public interface ExaminerRepository extends JpaRepository<Examiner, Integer> {
    boolean existsByEmail(String email);

    Examiner findByEmail(String email);

    Examiner findByEmailAndTempPassword(String email, String tempPassword);

    Examiner findByUser(com.soes.nex.model.User user);
}