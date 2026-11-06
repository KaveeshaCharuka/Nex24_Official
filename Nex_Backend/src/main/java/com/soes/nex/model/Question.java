package com.soes.nex.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String optionE;
    private Integer optionCount;
    private String questionType; // MCQ, STRUCTURED

    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }

    @JsonIgnore 
    @jakarta.persistence.Convert(converter = com.soes.nex.security.DatabaseEncryptionConverter.class)
    @jakarta.persistence.Column(name = "correct_answer", length = 255)
    private String correctAnswer; 

    // 💡 Many-to-One සම්බන්ධතාවය
    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnore 
    private Exam exam;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getOptionA() { return optionA; }
    public void setOptionA(String optionA) { this.optionA = optionA; }

    public String getOptionB() { return optionB; }
    public void setOptionB(String optionB) { this.optionB = optionB; }

    public String getOptionC() { return optionC; }
    public void setOptionC(String optionC) { this.optionC = optionC; }

    public String getOptionD() { return optionD; }
    public void setOptionD(String optionD) { this.optionD = optionD; }

    public String getOptionE() { return optionE; }
    public void setOptionE(String optionE) { this.optionE = optionE; }

    public Integer getOptionCount() { return optionCount; }
    public void setOptionCount(Integer optionCount) { this.optionCount = optionCount; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
}