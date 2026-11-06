package com.soes.nex.security;

// ⚠️ මේවා ඔයාගේ යාළුවා හදපු ගමන් කමෙන්ට් අයින් කරන්න
// import com.soes.nex.model.User;
// import com.soes.nex.repository.UserRepository;

import java.util.ArrayList;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// @Service (Disabled in favor of CustomUserDetailsService)
public class UserDetailsServiceImpl implements UserDetailsService {

    // @Autowired
    // private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // 1. Database එකෙන් User ව හොයනවා (දැනට කමෙන්ට් කරලා තියෙන්නේ)
        /*
        User user = userRepository.findByUsername(username);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        
        // 2. Spring Security එකට තේරෙන විදිහට User ගේ විස්තර ටික අරන් දෙනවා
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>() // 👈 ඉස්සරහට මෙතනට Roles (Student/Admin) දාන්න පුළුවන්
        );
        */

        // ⚠️ අනිත් අය Database කෑල්ල හදලා ඉවර වෙනකන් Error එන්නේ නැති වෙන්න දාපු තාවකාලික කෝඩ් එකක්:
        return new org.springframework.security.core.userdetails.User(
                "testuser",
                "testpassword",
                new ArrayList<>()
        );
    }
}