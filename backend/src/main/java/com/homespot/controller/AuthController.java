package com.homespot.controller;

import com.homespot.dto.ApiResponse;
import com.homespot.dto.LoginRequest;
import com.homespot.dto.SignupRequest;
import com.homespot.model.User;
import com.homespot.repository.UserRepository;
import com.homespot.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            if (req.getUsername() == null || req.getUsername().trim().isEmpty() ||
                req.getPassword() == null || req.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Username/Email and Password are required"));
            }

            String input = req.getUsername().trim();
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(input);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid username/email or password"));
            }

            User user = userOpt.get();
            if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid username/email or password"));
            }

            String token = jwtUtil.generateToken(user);

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", userData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        try {
            if (req.getUsername() == null || req.getEmail() == null || req.getPassword() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Username, email and password are required"));
            }

            if (userRepository.existsByUsername(req.getUsername().trim())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Username already taken"));
            }

            if (userRepository.existsByEmail(req.getEmail().trim())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Email already registered"));
            }

            String role = req.getRole() != null ? req.getRole().toLowerCase() : "user";
            if (!"user".equals(role) && !"landlord".equals(role)) {
                role = "user";
            }

            User user = new User(
                    req.getUsername().trim(),
                    req.getEmail().trim(),
                    passwordEncoder.encode(req.getPassword()),
                    role
            );

            User savedUser = userRepository.save(user);
            String token = jwtUtil.generateToken(savedUser);

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", savedUser.getId());
            userData.put("username", savedUser.getUsername());
            userData.put("email", savedUser.getEmail());
            userData.put("role", savedUser.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", userData);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Signup failed: " + e.getMessage()));
        }
    }
}
