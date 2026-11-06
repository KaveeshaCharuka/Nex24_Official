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

import com.soes.nex.model.Question;
import com.soes.nex.repository.QuestionRepository;
import com.soes.nex.service.DatabaseSyncService;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private DatabaseSyncService databaseSyncService;

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionRepository.findAll());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addQuestion(@RequestBody Question question) {
        try {
            Question saved = questionRepository.save(question);
            // Dual-schema synchronization: also write to 'question' and 'question_option' tables
            databaseSyncService.syncQuestionDualSchema(saved);
            return ResponseEntity.ok("Question added and synchronized successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error adding question: " + e.getMessage());
        }
    }
}
