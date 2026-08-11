package com.homespot.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @NotBlank(message = "Please provide a username")
    private String username;

    @NotBlank(message = "Please provide an email")
    @Email(message = "Please provide a valid email address")
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+-]+@(gmail\\.com|yahoo\\.co\\.in|yahoo\\.com|outlook\\.com|hotmail\\.com|rediffmail\\.com)$",
        message = "Allowed domains: @gmail.com, @yahoo.co.in, @yahoo.com, @outlook.com, @hotmail.com, @rediffmail.com"
    )
    private String email;

    @NotBlank(message = "Please add a password")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$",
        message = "Password must contain 1 uppercase letter, 1 number, and 1 special character."
    )
    private String password;

    private String role;

    public SignupRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
