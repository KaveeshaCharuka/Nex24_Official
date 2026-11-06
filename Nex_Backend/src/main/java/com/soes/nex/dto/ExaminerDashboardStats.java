package com.soes.nex.dto;

public class ExaminerDashboardStats {
    private long activeCourses;
    private long questionBankSize;
    private long papersToGrade;
    private long upcomingExams;

    public ExaminerDashboardStats(long activeCourses, long questionBankSize, long papersToGrade, long upcomingExams) {
        this.activeCourses = activeCourses;
        this.questionBankSize = questionBankSize;
        this.papersToGrade = papersToGrade;
        this.upcomingExams = upcomingExams;
    }

    public long getActiveCourses() { return activeCourses; }
    public void setActiveCourses(long activeCourses) { this.activeCourses = activeCourses; }

    public long getQuestionBankSize() { return questionBankSize; }
    public void setQuestionBankSize(long questionBankSize) { this.questionBankSize = questionBankSize; }

    public long getPapersToGrade() { return papersToGrade; }
    public void setPapersToGrade(long papersToGrade) { this.papersToGrade = papersToGrade; }

    public long getUpcomingExams() { return upcomingExams; }
    public void setUpcomingExams(long upcomingExams) { this.upcomingExams = upcomingExams; }
}