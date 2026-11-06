package com.soes.nex.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    // 💡 ළමයා Account එක හදනකම් User කෙනෙක් නැති නිසා nullable = true කළා
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
    private User user;

    @Column(name = "index_number", unique = true)
    private String indexNumber;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "course_id")
    private Integer courseId;

    // --- අලුතින් එකතු කරපු Phase 1 & 2 Fields ---
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Lob 
    @Column(name = "reference_image", columnDefinition = "LONGBLOB")
    private byte[] referenceImage; 

    @Column(name = "temp_username")
    private String tempUsername;
    
    @jakarta.persistence.Convert(converter = com.soes.nex.security.DatabaseEncryptionConverter.class)
    @Column(name = "otp", length = 255)
    private String otp;

    // 💡 මුහුණේ දත්ත Image එකක් නිසා byte[] විදිහට හැදුවා
    @Lob
    @Column(name = "face_id_data", columnDefinition = "LONGBLOB")
    private byte[] faceIdData; 

    @Column(name = "is_face_registered")
    private boolean isFaceRegistered = false;

    // 💡 Password Field එක (BCrypt Hashed)
    @Column(name = "password", length = 255)
    private String password;

    // ---- Getters and Setters ----
    
    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getIndexNumber() { return indexNumber; }
    public void setIndexNumber(String indexNumber) { this.indexNumber = indexNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public byte[] getReferenceImage() { return referenceImage; }
    public void setReferenceImage(byte[] referenceImage) { this.referenceImage = referenceImage; }

    public String getTempUsername() { return tempUsername; }
    public void setTempUsername(String tempUsername) { this.tempUsername = tempUsername; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public byte[] getFaceIdData() { return faceIdData; }
    public void setFaceIdData(byte[] faceIdData) { this.faceIdData = faceIdData; }

    public boolean isFaceRegistered() { return isFaceRegistered; }
    public void setFaceRegistered(boolean faceRegistered) { this.isFaceRegistered = faceRegistered; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}