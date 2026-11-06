package com.soes.nex.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.FaceData;

@Repository
public interface FaceDataRepository extends JpaRepository<FaceData, Integer> {
    Optional<FaceData> findByStudentId(Integer studentId);
}