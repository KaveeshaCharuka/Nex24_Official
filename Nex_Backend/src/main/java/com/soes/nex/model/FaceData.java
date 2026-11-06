package com.soes.nex.model;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "face_data")
public class FaceData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "face_id")
    private Integer faceId;

    @Column(name = "student_id", unique = true, nullable = false)
    private Integer studentId;

    @jakarta.persistence.Convert(converter = com.soes.nex.security.DatabaseEncryptionConverter.class)
    @Column(name = "face_template", columnDefinition = "LONGTEXT", nullable = false)
    private String faceTemplate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

   public Integer getFaceId() { return faceId; }
    public void setFaceId(Integer faceId) { this.faceId = faceId; }

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    public String getFaceTemplate() { return faceTemplate; }
    public void setFaceTemplate(String faceTemplate) { this.faceTemplate = faceTemplate; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}