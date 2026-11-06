package com.soes.nex.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.soes.nex.model.Course;
import com.soes.nex.repository.CourseRepository;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    // සියලුම Courses ලබා ගැනීම
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // අලුත් Course එකක් ඇතුළත් කිරීම
    public Course createCourse(Course course) {
        if (course.getCreatedBy() == null) {
            course.setCreatedBy(1);
        }
        return courseRepository.save(course);
    }
}