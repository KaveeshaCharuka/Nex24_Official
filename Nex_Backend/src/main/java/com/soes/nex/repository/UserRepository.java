package com.soes.nex.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.soes.nex.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    User findByEmail(String email);
    User findByUsername(String username);
    User findFirstByEmail(String email);
    User findFirstByUsername(String username);
    java.util.List<User> findByRole(String role);

}