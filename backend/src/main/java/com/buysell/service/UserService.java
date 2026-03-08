package com.buysell.service;

import com.buysell.dto.AuthResponse;
import com.buysell.dto.LoginRequest;
import com.buysell.dto.RegisterRequest;
import com.buysell.exception.ResourceNotFoundException;
import com.buysell.model.User;
import com.buysell.repository.UserRepository;
import com.buysell.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {}", saved.getEmail());
        return buildResponse(saved);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = getByEmail(req.getEmail());
        log.info("User logged in: {}", user.getEmail());
        return buildResponse(user);
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Transactional
    public User updateProfile(String email, User data) {
        User user = getByEmail(email);
        if (data.getFirstName() != null) user.setFirstName(data.getFirstName());
        if (data.getLastName() != null) user.setLastName(data.getLastName());
        if (data.getPhone() != null) user.setPhone(data.getPhone());
        if (data.getAddress() != null) user.setAddress(data.getAddress());
        if (data.getCity() != null) user.setCity(data.getCity());
        if (data.getPostalCode() != null) user.setPostalCode(data.getPostalCode());
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = getByEmail(email);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is wrong");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().name());
    }
}
