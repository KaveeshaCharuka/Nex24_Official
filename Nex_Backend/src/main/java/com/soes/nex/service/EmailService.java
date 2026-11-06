package com.soes.nex.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // 1. Student ට යවන HTML ඊමේල් එක
    public void sendEnrollmentEmail(String toEmail, String fullName, String tempUsername, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nex24.dev@gmail.com"); 
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Nex24 - Account Activation");

            String activationLink = "http://localhost:5173/face-register?tempUsername=" + tempUsername;

            String htmlContent = "<div style='font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;'>"
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>"
                    + "<div style='background-color: #1e293b; padding: 20px; text-align: center; border-bottom: 2px solid #38bdf8;'>"
                    + "<h1 style='color: #38bdf8; margin: 0; font-size: 28px; letter-spacing: 2px;'>Nex24</h1>"
                    + "</div>"
                    + "<div style='padding: 30px; color: #f8fafc;'>"
                    + "<h2 style='color: #e2e8f0; margin-top: 0;'>Hello " + fullName + ",</h2>"
                    + "<p style='color: #cbd5e1; font-size: 16px; line-height: 1.6;'>"
                    + "Welcome to <strong>Nex24 Examination System</strong>! Your account has been securely created by the institute administrator. "
                    + "Please use the temporary credentials below to verify your face and activate your account.</p>"
                    + "<div style='background-color: #1e293b; padding: 15px; border-radius: 5px; margin: 25px 0; border: 1px dashed #475569; text-align: center;'>"
                    + "<p style='margin: 5px 0; color: #cbd5e1; font-size: 16px;'>Temp Username: <br><strong style='color: #38bdf8; font-size: 22px; letter-spacing: 1px;'>" + tempUsername + "</strong></p>"
                    + "<p style='margin: 15px 0 5px 0; color: #cbd5e1; font-size: 16px;'>OTP Code: <br><strong style='color: #38bdf8; font-size: 22px; letter-spacing: 2px;'>" + otp + "</strong></p>"
                    + "</div>"
                    + "<div style='text-align: center; margin-top: 30px;'>"
                    + "<a href='" + activationLink + "' style='background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;'>Activate My Account</a>"
                    + "</div>"
                    + "<p style='color: #64748b; font-size: 13px; margin-top: 30px; text-align: center;'>"
                    + "If you did not request this account, please ignore this email or contact the institute admin.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Student HTML Email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Error sending HTML email to " + toEmail + ": " + e.getMessage());
        }
    }

    // 2. Examiner ට යවන අලුත් ලස්සන HTML ඊමේල් එක
    public void sendExaminerInvitationEmail(String toEmail, String fullName, String tempUsername, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nex24.dev@gmail.com"); 
            helper.setTo(toEmail);
            helper.setSubject("Nex24 - Examiner Account Invitation");

            // Examiner සඳහා කෙලින්ම Account Activation පේජ් එකට යවන ලින්ක් එක
            String activationLink = "http://localhost:5173/examiner-setup?username=" + tempUsername;

            String htmlContent = "<div style='font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;'>"
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>"
                    + "<div style='background-color: #1e293b; padding: 20px; text-align: center; border-bottom: 2px solid #38bdf8;'>"
                    + "<h1 style='color: #38bdf8; margin: 0; font-size: 28px; letter-spacing: 2px;'>Nex24</h1>"
                    + "</div>"
                    + "<div style='padding: 30px; color: #f8fafc;'>"
                    + "<h2 style='color: #e2e8f0; margin-top: 0;'>Hello " + fullName + ",</h2>"
                    + "<p style='color: #cbd5e1; font-size: 16px; line-height: 1.6;'>"
                    + "You have been invited as an <strong>Examiner</strong> to the <strong>Nex24 Examination System</strong>. "
                    + "Please use the temporary credentials below to activate your account and set your permanent password.</p>"
                    + "<div style='background-color: #1e293b; padding: 15px; border-radius: 5px; margin: 25px 0; border: 1px dashed #475569; text-align: center;'>"
                    + "<p style='margin: 5px 0; color: #cbd5e1; font-size: 16px;'>Temp Username: <br><strong style='color: #38bdf8; font-size: 22px; letter-spacing: 1px;'>" + tempUsername + "</strong></p>"
                    + "<p style='margin: 15px 0 5px 0; color: #cbd5e1; font-size: 16px;'>Activation OTP: <br><strong style='color: #38bdf8; font-size: 22px; letter-spacing: 2px;'>" + tempPassword + "</strong></p>"
                    + "</div>"
                    + "<div style='text-align: center; margin-top: 30px;'>"
                    + "<a href='" + activationLink + "' style='background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;'>Activate Examiner Account</a>"
                    + "</div>"
                    + "<p style='color: #64748b; font-size: 13px; margin-top: 30px; text-align: center;'>"
                    + "If you did not expect this invitation, please ignore this email.</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Examiner HTML Email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Error sending Examiner HTML email to " + toEmail + ": " + e.getMessage());
            System.out.println("🔑 Fallback Examiner Credentials: Username=" + tempUsername + ", OTP=" + tempPassword);
        }
    }

    // 3. Plain Text ඊමේල් යැවීමට (Compilation Error එක මඟහරවා ගැනීමට මෙය අනිවාර්යයෙන්ම තිබිය යුතුය)
    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("nex24.dev@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        
        mailSender.send(message); 
        System.out.println("Simple Email sent successfully to: " + to);
    }

    // 4. System Notification HTML Email for critical alerts & announcements
    public void sendNotificationEmail(String toEmail, String recipientName, String title, String body, String type) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("nex24.dev@gmail.com"); 
            helper.setTo(toEmail);
            helper.setSubject("Nex24 Notification: " + title);

            String badgeColor = "#38bdf8"; // default blue
            if ("ALERT".equalsIgnoreCase(type) || "WARNING".equalsIgnoreCase(type)) {
                badgeColor = "#ef4444"; // red
            } else if ("SUCCESS".equalsIgnoreCase(type)) {
                badgeColor = "#22c55e"; // green
            }

            String htmlContent = "<div style='font-family: Arial, sans-serif; background-color: #0b0f19; padding: 25px; color: #ffffff;'>"
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 4px 15px rgba(0,0,0,0.5);'>"
                    + "<div style='background-color: #1e293b; padding: 20px; text-align: center; border-bottom: 2px solid " + badgeColor + ";'>"
                    + "<h1 style='color: " + badgeColor + "; margin: 0; font-size: 26px; letter-spacing: 2px;'>Nex24 System Alert</h1>"
                    + "</div>"
                    + "<div style='padding: 30px; color: #f8fafc;'>"
                    + "<h2 style='color: #e2e8f0; margin-top: 0; font-size: 20px;'>Hello " + (recipientName != null ? recipientName : "User") + ",</h2>"
                    + "<div style='background-color: #131c31; padding: 18px; border-radius: 8px; margin: 20px 0; border-left: 4px solid " + badgeColor + ";'>"
                    + "<h3 style='margin: 0 0 10px 0; color: #ffffff; font-size: 18px;'>" + title + "</h3>"
                    + "<p style='color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0;'>" + body + "</p>"
                    + "</div>"
                    + "<p style='color: #64748b; font-size: 13px; margin-top: 25px; text-align: center;'>"
                    + "This is an automated notification from Nex24 AI-Proctored Examination Platform."
                    + "</p>"
                    + "</div>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Notification HTML Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Note: Could not dispatch live email to " + toEmail + " (" + e.getMessage() + "). Notification recorded in-app.");
        }
    }
}