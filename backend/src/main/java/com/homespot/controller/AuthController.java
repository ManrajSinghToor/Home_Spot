package com.homespot.controller;

import com.homespot.dto.*;
import com.homespot.model.User;
import com.homespot.repository.UserRepository;
import com.homespot.security.JwtUtil;
import com.homespot.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            // Check duplicate username
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(false, "Username is already taken"));
            }

            // Check duplicate email
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(false, "Email is already registered"));
            }

            String role = request.getRole() != null && !request.getRole().isBlank() ? request.getRole() : "user";

            User user = new User(
                    request.getUsername().trim(),
                    request.getEmail().trim(),
                    passwordEncoder.encode(request.getPassword()),
                    role
            );

            User savedUser = userRepository.save(user);
            String token = jwtUtil.generateToken(savedUser);

            AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                    savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Account does not exist, sign up first"));
            }

            User user = userOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Invalid username or password"));
            }

            if (request.getRole() != null && !request.getRole().isBlank() && !request.getRole().equals(user.getRole())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Login as incorrect role"));
            }

            String token = jwtUtil.generateToken(user);
            AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                    user.getUsername(), user.getEmail(), user.getRole()
            );

            return ResponseEntity.ok(new AuthResponse(token, userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @RequestBody UpdateProfileRequest request) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, "Not authorized"));
            }

            String newUsername = request.getUsername() != null ? request.getUsername().trim() : "";
            if (newUsername.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(false, "Username is required"));
            }

            Optional<User> existing = userRepository.findByUsername(newUsername);
            if (existing.isPresent() && !existing.get().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(false, "Username is already taken"));
            }

            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new AuthResponse(false, "User not found"));
            }

            User user = userOpt.get();
            user.setUsername(newUsername);
            User savedUser = userRepository.save(user);

            String token = jwtUtil.generateToken(savedUser);
            AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                    savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole()
            );

            return ResponseEntity.ok(new AuthResponse(token, userDto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @RequestBody ChangePasswordRequest request) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            if (request.getCurrentPassword() == null || request.getNewPassword() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Current and new passwords are required"));
            }

            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Incorrect current password"));
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
