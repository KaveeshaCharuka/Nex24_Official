package com.soes.nex.dto;

import java.util.Date;
import java.util.List;

public class ExamCreateRequest {
    private String examTitle;
    private Integer courseId;
    private Integer examinerId;
    private Integer totalMarks;
    private Integer durationMinutes;
    private Date examDate;
    private List<Integer> questionIds;

    // Getters and Setters
    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public Integer getExaminerId() { return examinerId; }
    public void setExaminerId(Integer examinerId) { this.examinerId = examinerId; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Date getExamDate() { return examDate; }
    public void setExamDate(Date examDate) { this.examDate = examDate; }

    public List<Integer> getQuestionIds() { return questionIds; }
    public void setQuestionIds(List<Integer> questionIds) { this.questionIds = questionIds; }
}
