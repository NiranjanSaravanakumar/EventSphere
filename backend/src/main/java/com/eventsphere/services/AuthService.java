package com.eventsphere.services;

import com.eventsphere.dto.AuthDTOs.*;
import com.eventsphere.entities.Role;
import com.eventsphere.entities.User;
import com.eventsphere.repositories.RoleRepository;
import com.eventsphere.repositories.UserRepository;
import com.eventsphere.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered: " + request.email());
        }

        String roleName = (request.role() != null && !request.role().isBlank())
                ? request.role()
                : "ROLE_ATTENDEE";

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of(role))
                .build();

        userRepository.save(user);

        // Authenticate immediately after registration to return a token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), roleName);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String roleName = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("ROLE_ATTENDEE");

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), roleName);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String roleName = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("ROLE_ATTENDEE");

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), roleName);
    }
}
