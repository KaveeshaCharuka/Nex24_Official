package com.soes.nex.service;

import java.sql.Timestamp;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soes.nex.model.Admin;
import com.soes.nex.model.Exam;
import com.soes.nex.model.ExamAttempt;
import com.soes.nex.model.ExamQuestion;
import com.soes.nex.model.ExamResult;
import com.soes.nex.model.FaceData;
import com.soes.nex.model.Question;
import com.soes.nex.model.QuestionOption;
import com.soes.nex.model.Result;
import com.soes.nex.model.Student;
import com.soes.nex.model.StudentAnswer;
import com.soes.nex.model.User;
import com.soes.nex.repository.AdminRepository;
import com.soes.nex.repository.CourseRepository;
import com.soes.nex.repository.ExamAttemptRepository;
import com.soes.nex.repository.ExamQuestionRepository;
import com.soes.nex.repository.ExamRepository;
import com.soes.nex.repository.ExamResultRepository;
import com.soes.nex.repository.FaceDataRepository;
import com.soes.nex.repository.QuestionOptionRepository;
import com.soes.nex.repository.QuestionRepository;
import com.soes.nex.repository.ResultRepository;
import com.soes.nex.repository.StudentAnswerRepository;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;

@Service
public class DatabaseSyncService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FaceDataRepository faceDataRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamQuestionRepository examQuestionRepository;

    @Autowired
    private QuestionOptionRepository questionOptionRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Synchronizes a Question entity across 'questions', 'question', and 'question_option' tables.
     */
    @Transactional
    public void syncQuestionDualSchema(Question question) {
        if (question == null || question.getQuestionText() == null) return;

        Integer examId = (question.getExam() != null) ? question.getExam().getExamId() : 1;

        // 1. Sync to 'question' table
        List<ExamQuestion> existingQuestions = examQuestionRepository.findByExamId(examId);
        ExamQuestion matchedExamQuestion = null;
        for (ExamQuestion eq : existingQuestions) {
            if (eq.getQuestionText() != null && eq.getQuestionText().trim().equalsIgnoreCase(question.getQuestionText().trim())) {
                matchedExamQuestion = eq;
                break;
            }
        }

        if (matchedExamQuestion == null) {
            matchedExamQuestion = new ExamQuestion(examId, 20, question.getQuestionText());
            matchedExamQuestion = examQuestionRepository.save(matchedExamQuestion);
        }

        Integer eqId = matchedExamQuestion.getQuestionId();

        // 2. Sync to 'question_option' table
        List<QuestionOption> existingOptions = questionOptionRepository.findByQuestionId(eqId);
        String correct = question.getCorrectAnswer() != null ? question.getCorrectAnswer().trim() : "A";

        syncOption(existingOptions, eqId, question.getOptionA(), "A".equalsIgnoreCase(correct));
        syncOption(existingOptions, eqId, question.getOptionB(), "B".equalsIgnoreCase(correct));
        syncOption(existingOptions, eqId, question.getOptionC(), "C".equalsIgnoreCase(correct));
        syncOption(existingOptions, eqId, question.getOptionD(), "D".equalsIgnoreCase(correct));
        if (question.getOptionE() != null && !question.getOptionE().trim().isEmpty()) {
            syncOption(existingOptions, eqId, question.getOptionE(), "E".equalsIgnoreCase(correct));
        }
    }

    private void syncOption(List<QuestionOption> existing, Integer questionId, String optionText, boolean isCorrect) {
        if (optionText == null || optionText.trim().isEmpty()) return;
        boolean found = false;
        for (QuestionOption opt : existing) {
            if (opt.getOptionText() != null && opt.getOptionText().trim().equalsIgnoreCase(optionText.trim())) {
                found = true;
                opt.setIsCorrect(isCorrect ? 1 : 0);
                questionOptionRepository.save(opt);
                break;
            }
        }
        if (!found) {
            QuestionOption newOpt = new QuestionOption();
            newOpt.setQuestionId(questionId);
            newOpt.setOptionText(optionText.trim());
            newOpt.setIsCorrect(isCorrect ? 1 : 0);
            questionOptionRepository.save(newOpt);
        }
    }

    /**
     * Simultaneously updates exam_results, exam_attempt, student_answer, and result tables.
     */
    @Transactional
    public ExamResult recordFullExamSubmission(
            Integer examId, 
            String submittingUser, 
            Map<Integer, String> studentAnswers, 
            List<Question> questions, 
            int score,
            Exam exam) {

        // 1. Save to 'exam_results'
        ExamResult examResult = new ExamResult();
        examResult.setExamId(examId);
        examResult.setUsername(submittingUser);
        examResult.setScore(score);
        examResult.setTotalQuestions(questions.size());
        examResult.setSubmittedAt(new Date());
        examResult = examResultRepository.save(examResult);

        // Find Student
        Integer studentId = 1;
        Optional<Student> studentOpt = studentRepository.findByUserUsername(submittingUser);
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByUserEmail(submittingUser);
        }
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByIndexNumber(submittingUser);
        }
        if (studentOpt.isPresent()) {
            studentId = studentOpt.get().getStudentId();
        }

        // 2. Save to 'exam_attempt'
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExamId(examId);
        attempt.setStudentId(studentId);
        long durationMs = (exam != null && exam.getDurationMinutes() != null) 
                ? (exam.getDurationMinutes() * 60000L) : 3600000L;
        attempt.setStartTime(new Date(System.currentTimeMillis() - durationMs));
        attempt.setEndTime(new Date());
        attempt.setStatus("COMPLETED");
        attempt = examAttemptRepository.save(attempt);

        // 3. Save to 'student_answer'
        if (studentAnswers != null && !studentAnswers.isEmpty()) {
            for (Map.Entry<Integer, String> entry : studentAnswers.entrySet()) {
                Integer questionId = entry.getKey();
                String selectedChoice = entry.getValue();

                int optionIndex = 1;
                if ("B".equalsIgnoreCase(selectedChoice)) optionIndex = 2;
                else if ("C".equalsIgnoreCase(selectedChoice)) optionIndex = 3;
                else if ("D".equalsIgnoreCase(selectedChoice)) optionIndex = 4;
                else if ("E".equalsIgnoreCase(selectedChoice)) optionIndex = 5;

                StudentAnswer sa = new StudentAnswer();
                sa.setAttemptId(attempt.getAttemptId());
                sa.setQuestionId(questionId);
                sa.setSelectedOptionId(optionIndex);
                studentAnswerRepository.save(sa);
            }
        }

        // 4. Save to 'result'
        int totalMarks = (exam != null && exam.getTotalMarks() != null) ? exam.getTotalMarks() : 100;
        int maxQuestions = Math.max(1, questions.size());
        int obtainedMarks = (int) Math.round(((double) score / maxQuestions) * totalMarks);
        double percentage = Math.round((((double) score / maxQuestions) * 100.0) * 100.0) / 100.0;

        String grade = "F";
        if (percentage >= 85) grade = "A+";
        else if (percentage >= 75) grade = "A";
        else if (percentage >= 65) grade = "B";
        else if (percentage >= 55) grade = "C";
        else if (percentage >= 45) grade = "S";

        Result result = new Result();
        result.setExamId(examId);
        result.setStudentId(studentId);
        result.setTotalMarks(totalMarks);
        result.setObtainedMarks(obtainedMarks);
        result.setPercentage(percentage);
        result.setGrade(grade);
        result.setGeneratedAt(new Timestamp(System.currentTimeMillis()));
        resultRepository.save(result);

        return examResult;
    }

    /**
     * Synchronizes face biometrics into 'face_data' table.
     */
    @Transactional
    public void syncFaceDataForStudent(Integer studentId, byte[] faceBytes) {
        if (studentId == null || faceBytes == null || faceBytes.length == 0) return;

        Optional<FaceData> existing = faceDataRepository.findByStudentId(studentId);
        FaceData faceData = existing.orElse(new FaceData());
        faceData.setStudentId(studentId);
        faceData.setFaceTemplate(Base64.getEncoder().encodeToString(faceBytes));
        faceDataRepository.save(faceData);
    }

    /**
     * Synchronizes admin users into 'admin' table.
     */
    @Transactional
    public void syncAdminUser(String email, String fullName, String encodedPassword) {
        if (email == null) return;
        Optional<Admin> existing = adminRepository.findByEmail(email);
        if (existing.isEmpty()) {
            Admin admin = new Admin();
            admin.setEmail(email);
            admin.setFullName(fullName != null ? fullName : "Administrator");
            admin.setPassword(encodedPassword != null ? encodedPassword : "");
            adminRepository.save(admin);
        }
    }
}
