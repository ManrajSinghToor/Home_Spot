package com.homespot.repository;

import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :input OR u.email = :input")
    Optional<User> findByUsernameOrEmail(@Param("input") String input);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
