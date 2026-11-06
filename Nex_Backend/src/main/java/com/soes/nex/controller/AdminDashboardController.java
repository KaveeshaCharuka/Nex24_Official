package com.soes.nex.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.dto.AdminDashboardData;
import com.soes.nex.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    // GET: http://localhost:8080/api/admin/dashboard/data
    @GetMapping("/data")
    public ResponseEntity<AdminDashboardData> getAdminDashboardData() {
        AdminDashboardData data = adminDashboardService.getDashboardData();
        return ResponseEntity.ok(data);
    }
}