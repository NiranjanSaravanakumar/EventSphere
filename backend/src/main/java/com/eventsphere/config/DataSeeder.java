package com.eventsphere.config;

import com.eventsphere.entities.Role;
import com.eventsphere.entities.User;
import com.eventsphere.repositories.RoleRepository;
import com.eventsphere.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

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
            log.info("Seeded default admin account: admin@eventsphere.com");
        }
    }
}
