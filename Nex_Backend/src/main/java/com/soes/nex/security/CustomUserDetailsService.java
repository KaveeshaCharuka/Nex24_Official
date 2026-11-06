package com.soes.nex.security;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.soes.nex.model.Student;
import com.soes.nex.model.User;
import com.soes.nex.repository.StudentRepository;
import com.soes.nex.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(identifier);
        if (user == null) {
            user = userRepository.findByEmail(identifier);
        }
        if (user == null) {
            Optional<Student> studentOpt = studentRepository.findByIndexNumber(identifier);
            if (studentOpt.isPresent() && studentOpt.get().getUser() != null) {
                user = studentOpt.get().getUser();
            }
        }

        if (user == null) {
            throw new UsernameNotFoundException("User not found with identifier: " + identifier);
        }

        String principalName = (user.getUsername() != null && !user.getUsername().isEmpty()) 
                                ? user.getUsername() 
                                : user.getEmail();

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (user.getRole() != null && !user.getRole().trim().isEmpty()) {
            String roleName = user.getRole().trim().toUpperCase();
            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName;
            }
            authorities.add(new SimpleGrantedAuthority(roleName));
        }

        return new org.springframework.security.core.userdetails.User(
                principalName,
                user.getPassword(),
                authorities
        );
    }
}