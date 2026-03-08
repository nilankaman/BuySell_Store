package com.buysell.controller;

import com.buysell.dto.*;
import com.buysell.model.User;
import com.buysell.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Welcome aboard! Your account is all set.", userService.register(req)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Login successful! Glad to see you back.", userService.login(req)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Here’s your profile.", userService.getByEmail(user.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody User data) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully!", userService.updateProfile(user.getUsername(), data)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, String> body) {
        userService.changePassword(user.getUsername(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully. Stay secure!", null));
    }
}