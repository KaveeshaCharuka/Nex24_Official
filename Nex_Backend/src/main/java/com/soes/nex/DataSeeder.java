package com.soes.nex;

import com.soes.nex.model.Course;
import com.soes.nex.model.Exam;
import com.soes.nex.model.Question;
import com.soes.nex.repository.CourseRepository;
import com.soes.nex.repository.ExamRepository;
import com.soes.nex.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Optional;

// @Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public void run(String... args) throws Exception {
        

        Course course;
        Optional<Course> courseOpt = courseRepository.findById(1);
        if (courseOpt.isEmpty()) {
            course = new Course();
            course.setCourseName("Data Structures");
            course.setCourseCode("CS101");
            course.setCreatedBy(1);
            course = courseRepository.save(course);
            System.out.println("✅ Sample Course Created.");
        } else {
            course = courseOpt.get();
        }

        // 2. Create a sample Exam if not exists
        Exam exam;
        Optional<Exam> examOpt = examRepository.findById(1);
        if (examOpt.isEmpty()) {
            exam = new Exam();
            exam.setExamTitle("Midterm - Data Structures");
            exam.setCourseId(course.getCourseId());
            exam.setExaminerId(1);
            exam.setTotalMarks(100);
            exam.setDurationMinutes(60);
            exam.setExamDate(new Date(System.currentTimeMillis() + 86400000L)); // Tomorrow
            exam.setStatus("ACTIVE");
            exam = examRepository.save(exam);
            System.out.println("✅ Sample Exam Created.");

            // 3. Create Sample Questions for the exam
            Question q1 = new Question();
            q1.setExam(exam);
            q1.setQuestionText("What is the time complexity of a binary search?");
            q1.setOptionA("O(n)");
            q1.setOptionB("O(log n)");
            q1.setOptionC("O(n^2)");
            q1.setOptionD("O(1)");
            q1.setCorrectAnswer("B");
            questionRepository.save(q1);

            Question q2 = new Question();
            q2.setExam(exam);
            q2.setQuestionText("Which data structure uses LIFO?");
            q2.setOptionA("Queue");
            q2.setOptionB("Stack");
            q2.setOptionC("Array");
            q2.setOptionD("Linked List");
            q2.setCorrectAnswer("B");
            questionRepository.save(q2);

            Question q3 = new Question();
            q3.setExam(exam);
            q3.setQuestionText("Which sorting algorithm has the best average case time complexity?");
            q3.setOptionA("Bubble Sort");
            q3.setOptionB("Selection Sort");
            q3.setOptionC("Merge Sort");
            q3.setOptionD("Insertion Sort");
            q3.setCorrectAnswer("C");
            questionRepository.save(q3);

            System.out.println("✅ Sample Questions Created.");
        }
    }
}
