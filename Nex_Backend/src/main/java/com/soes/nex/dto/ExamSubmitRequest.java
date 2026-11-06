package com.soes.nex.dto;

import java.util.Map;

public class ExamSubmitRequest {
    
    private String username;
    // Map<QuestionId, SelectedOption> -> උදා: { 1: "A", 2: "C" }
    private Map<Integer, String> answers; 

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Map<Integer, String> getAnswers() { return answers; }
    public void setAnswers(Map<Integer, String> answers) { this.answers = answers; }
}