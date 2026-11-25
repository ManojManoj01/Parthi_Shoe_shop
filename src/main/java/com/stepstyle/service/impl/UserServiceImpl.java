package com.stepstyle.service.impl;

import com.stepstyle.dto.UpdateProfileRequest;
import com.stepstyle.dto.UserSummaryDto;
import com.stepstyle.entity.User;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.exception.UnauthorizedException;
import com.stepstyle.repository.UserRepository;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("No authenticated user found in session");
        }
        User user = findUserById(principal.getId());
        return UserSummaryDto.fromUser(user);
    }

    @Override
    @Transactional
    public UserSummaryDto updateCurrentUserProfile(UserPrincipal principal, UpdateProfileRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("You must be signed in to update your profile");
        }
        User user = findUserById(principal.getId());

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            user.setState(request.getState().trim());
        }
        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode().trim());
        }
        if (request.getShoeSize() != null) {
            user.setShoeSize(request.getShoeSize().trim());
        }
        if (request.getPreferredCategory() != null) {
            user.setPreferredCategory(request.getPreferredCategory().trim());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar().trim());
        }
        if (request.getNotifyPromotions() != null) {
            user.setNotifyPromotions(request.getNotifyPromotions());
        }
        if (request.getNotifyOrderUpdates() != null) {
            user.setNotifyOrderUpdates(request.getNotifyOrderUpdates());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        User saved = userRepository.save(user);
        return UserSummaryDto.fromUser(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
}
