package com.soes.nex;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.soes.nex.model.User;
import com.soes.nex.repository.UserRepository;

@SpringBootApplication
@EnableAsync // Background tasks (Async emails) සඳහා
public class NexApplication {

    public static void main(String[] args) {
        System.setProperty("java.net.preferIPv4Stack", "true");
        SpringApplication.run(NexApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // ඊමේල් එක මඟින් ඇඩ්මින් කෙනෙක් ඉන්නවදැයි පරීක්ෂා කිරීම (වඩාත් ස්ථාවරයි)
            if (userRepository.findByEmail("admin@devspire.com") == null) {
                
                User admin = new User();
                admin.setEmail("admin@devspire.com");
                admin.setPassword(passwordEncoder.encode("admin123")); 
                admin.setRole("ADMIN");
                
                userRepository.save(admin);
                System.out.println("🛡️ Pre-defined Admin Account Created Successfully!");
            }
        };
    }
}