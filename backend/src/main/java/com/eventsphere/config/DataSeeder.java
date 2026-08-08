package com.eventsphere.config;

import com.eventsphere.entities.Role;
import com.eventsphere.entities.User;
import com.eventsphere.repositories.RoleRepository;
import com.eventsphere.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("admin@eventsphere.com").isEmpty()) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found. Make sure schema.sql has seeded roles."));
            User admin = User.builder()
                .name("System Admin")
                .email("admin@eventsphere.com")
                .password(passwordEncoder.encode("admin123"))
                .roles(Set.of(adminRole))
                .build();
            userRepository.save(admin);
            System.out.println("Seeded admin account: admin@eventsphere.com / admin123");
        }
    }
}
