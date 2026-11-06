package com.soes.nex.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "examiner")
public class Examiner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "examiner_id")
    private Integer examinerId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @jakarta.persistence.Convert(converter = com.soes.nex.security.DatabaseEncryptionConverter.class)
    @Column(name = "temp_password", length = 255)
    private String tempPassword;
    
    @Column(name = "is_registered")
    private boolean isRegistered = false;

    // 💡 Password Field එක (BCrypt Hashed)
    @Column(name = "password", length = 255)
    private String password;

    // ---- Getters and Setters ----
    public Integer getExaminerId() { return examinerId; }
    public void setExaminerId(Integer examinerId) { this.examinerId = examinerId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTempPassword() { return tempPassword; }
    public void setTempPassword(String tempPassword) { this.tempPassword = tempPassword; }

    public boolean isRegistered() { return isRegistered; }
    public void setRegistered(boolean registered) { this.isRegistered = registered; }

    // 💡 අලුතින් එකතු කරපු Getters and Setters
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}