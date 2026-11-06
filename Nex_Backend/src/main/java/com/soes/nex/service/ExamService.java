package com.soes.nex.service;

import java.util.List; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service; 

import com.soes.nex.model.Exam;
import com.soes.nex.model.QuestionOption;
import com.soes.nex.repository.ExamRepository;
import com.soes.nex.repository.QuestionOptionRepository;

@Service // 💡 මේක අනිවාර්යයෙන්ම තියෙන්න ඕනේ
public class ExamService {
    
    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionOptionRepository optionRepository;

    // --- Exam Operations ---
    public Exam scheduleExam(Exam exam) {
        return examRepository.save(exam);
    }

    public List<Exam> getExamsByCourse(Integer courseId) {
        return examRepository.findByCourseId(courseId);
    }

    // --- Question & Option Operations ---
    public QuestionOption addOption(QuestionOption option) {
        return optionRepository.save(option);
    }

    public List<QuestionOption> getOptionsByQuestion(Integer questionId) {
        return optionRepository.findByQuestionId(questionId);
    }
}