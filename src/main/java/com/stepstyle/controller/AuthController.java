package com.stepstyle.controller;

import com.stepstyle.dto.*;
import com.stepstyle.security.UserPrincipal;
import com.stepstyle.service.AuthService;
import com.stepstyle.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", ""})
@Tag(name = "Authentication", description = "Endpoints for user signup, registration, login, token refresh, and password management")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /**
     * Step 2: Sign Up API
     * Validates input, hashes password using BCrypt, saves user to JPA repository, initializes cart,
     * and returns success response.
     */
    @PostMapping("/signup")
    @Operation(summary = "User Sign Up", description = "Register a new user account with hashed password and validations")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        ApiResponse<UserSummaryDto> response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register")
    @Operation(summary = "User Registration", description = "Register a new customer account")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<UserSummaryDto> response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Customer Login", description = "Authenticates customer account (ROLE_USER) and returns JWT access token")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.login(request, httpRequest, httpResponse));
    }

    @PostMapping("/api/admin/login")
    @Operation(summary = "Admin Login", description = "Authenticates dedicated administrator account (ROLE_ADMIN) and returns JWT access token")
    public ResponseEntity<AuthResponse> adminLogin(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.adminLogin(request, httpRequest, httpResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Returns details of the currently authenticated user")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getCurrentUser(userPrincipal));
    }

    @GetMapping("/api/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Current Admin Profile", description = "Returns details of the currently authenticated administrator")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<UserSummaryDto> getCurrentAdmin(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getCurrentUser(userPrincipal));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Current User Profile", description = "Updates profile and delivery preferences for the authenticated user only")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserSummaryDto updated = userService.updateCurrentUserProfile(userPrincipal, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password", description = "Sends a password reset token via email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Resets password using a valid reset token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh Customer Access Token", description = "Issues a new JWT access token using the HttpOnly customer refresh cookie")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(name = "stepstyle_refresh_token", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken, httpResponse));
    }

    @PostMapping("/api/admin/refresh")
    @Operation(summary = "Refresh Admin Access Token", description = "Issues a new JWT access token using the isolated HttpOnly admin refresh cookie")
    public ResponseEntity<AuthResponse> adminRefreshToken(
            @CookieValue(name = "stepstyle_admin_refresh_token", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.adminRefreshToken(refreshToken, httpResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Customer Logout", description = "Revokes customer refresh token and clears customer session cookie")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "stepstyle_refresh_token", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.logout(refreshToken, httpResponse));
    }

    @PostMapping("/api/admin/logout")
    @Operation(summary = "Admin Logout", description = "Revokes admin refresh token and clears admin session cookie")
    public ResponseEntity<ApiResponse<Void>> adminLogout(
            @CookieValue(name = "stepstyle_admin_refresh_token", required = false) String refreshToken,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.adminLogout(refreshToken, httpResponse));
    }
}
