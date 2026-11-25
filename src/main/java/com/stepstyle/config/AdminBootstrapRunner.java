package com.stepstyle.config;

import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.enabled:true}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.bootstrap.username:admin}")
    private String adminUsername;

    @Value("${app.admin.bootstrap.email:admin@stepstyle.com}")
    private String adminEmail;

    @Value("${app.admin.bootstrap.password:}")
    private String adminPassword;

    @Value("${app.admin.bootstrap.first-name:System}")
    private String adminFirstName;

    @Value("${app.admin.bootstrap.last-name:Administrator}")
    private String adminLastName;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled via configuration (app.admin.bootstrap.enabled=false).");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            log.info("Admin bootstrap skipped: No ADMIN_BOOTSTRAP_PASSWORD environment variable supplied.");
            return;
        }

        String normalizedAdminEmail = adminEmail.trim().toLowerCase();
        String normalizedAdminUsername = adminUsername.trim();

        var existingAdminOpt = userRepository.findByEmailIgnoreCase(normalizedAdminEmail)
                .or(() -> userRepository.findByUsernameIgnoreCase(normalizedAdminUsername));
        if (existingAdminOpt.isPresent()) {
            User existingUser = existingAdminOpt.get();
            if (existingUser.getRole() != Role.ROLE_ADMIN) {
                log.warn("Admin bootstrap: Account [{}] belongs to a non-admin user (role={}). Refusing to overwrite customer account.",
                        existingUser.getUsername(), existingUser.getRole());
                return;
            }
            existingUser.setPasswordHash(passwordEncoder.encode(adminPassword));
            existingUser.setActive(true);
            userRepository.save(existingUser);
            log.info("Admin bootstrap: Verified dedicated administrator account [{}] (username: {}).", normalizedAdminEmail, existingUser.getUsername());
            return;
        }

        log.info("Bootstrapping dedicated system administrator account [{}]...", normalizedAdminEmail);

        User admin = new User(
                normalizedAdminUsername,
                normalizedAdminEmail,
                passwordEncoder.encode(adminPassword),
                adminFirstName.trim(),
                adminLastName.trim(),
                Role.ROLE_ADMIN
        );

        userRepository.save(admin);

        log.info("Admin bootstrap completed: Successfully created dedicated administrator account [{}].", normalizedAdminEmail);
    }
}
