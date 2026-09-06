package com.velvra.backend.service;

import com.velvra.backend.dto.auth.AuthResponse;
import com.velvra.backend.dto.auth.LoginRequest;
import com.velvra.backend.dto.auth.RegisterRequest;
import com.velvra.backend.dto.common.UserSummary;
import com.velvra.backend.entity.CreatorProfile;
import com.velvra.backend.entity.Role;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.CreatorProfileRepository;
import com.velvra.backend.repository.UserRepository;
import com.velvra.backend.security.JwtService;
import com.velvra.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private static final BigDecimal DEFAULT_SUBSCRIPTION_PRICE = new BigDecimal("9.99");

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw ApiException.conflict("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Email is already registered");
        }

        Role role;
        try {
            role = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Role must be FAN or CREATOR");
        }
        if (role == Role.ADMIN) {
            throw ApiException.badRequest("Cannot self-register as ADMIN");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .role(role)
                .build();
        user = userRepository.save(user);

        if (role == Role.CREATOR) {
            CreatorProfile profile = CreatorProfile.builder()
                    .user(user)
                    .subscriptionPrice(DEFAULT_SUBSCRIPTION_PRICE)
                    .build();
            creatorProfileRepository.save(profile);
        }

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, UserSummary.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password()));

        User user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> ApiException.notFound("User not found"));

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);
        return new AuthResponse(token, UserSummary.from(user));
    }
}
