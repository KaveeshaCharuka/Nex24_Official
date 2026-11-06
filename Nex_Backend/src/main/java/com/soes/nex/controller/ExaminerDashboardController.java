package com.soes.nex.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.dto.ExaminerDashboardStats;
import com.soes.nex.service.ExaminerDashboardService;

@RestController
@RequestMapping("/api/examiner/dashboard")
@CrossOrigin(origins = "*")
public class ExaminerDashboardController {

    @Autowired
    private ExaminerDashboardService dashboardService;

    // GET: http://localhost:8080/api/examiner/dashboard/stats?examinerId=1
    @GetMapping("/stats")
    public ResponseEntity<ExaminerDashboardStats> getStats(@RequestParam(required = false, defaultValue = "1") Long examinerId) {
        ExaminerDashboardStats stats = dashboardService.getDashboardStats(examinerId);
        return ResponseEntity.ok(stats);
    }
}