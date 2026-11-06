package com.soes.nex.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soes.nex.model.Course;
import com.soes.nex.service.CourseService;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*") // Frontend එක එක්ක ලින්ක් වෙන්න
public class CourseController {

    @Autowired
    private CourseService courseService;

    // GET: http://localhost:8080/api/courses
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // POST: http://localhost:8080/api/courses
    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }
}