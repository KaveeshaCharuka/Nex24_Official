package com.soes.nex.repository;

import com.soes.nex.model.ProctorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProctorLogRepository extends JpaRepository<ProctorLog, Long> {
    List<ProctorLog> findByExamIdAndUsername(Integer examId, String username);
    List<ProctorLog> findByExamId(Integer examId);
    List<ProctorLog> findAllByOrderByTimestampDesc();
}
