package com.soes.nex.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    
    // Student ට ලින්ක් වෙලා ඉන්න User ගේ Email එකෙන් හොයන්න
    Optional<Student> findByUserEmail(String email);

    // Student ට ලින්ක් වෙලා ඉන්න User ගේ Username එකෙන් හොයන්න
    Optional<Student> findByUserUsername(String username);
    
    // Phase 1 & 2: Temp Username එකෙන් ළමයාව හොයන්න
    Optional<Student> findByTempUsername(String tempUsername);

    Student findByTempUsernameAndOtp(String tempUsername, String otp);

    Optional<Student> findByIndexNumber(String indexNumber);
}