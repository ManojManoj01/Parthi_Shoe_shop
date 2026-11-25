package com.stepstyle.service;

import com.stepstyle.dto.UpdateProfileRequest;
import com.stepstyle.dto.UserSummaryDto;
import com.stepstyle.entity.User;
import com.stepstyle.security.UserPrincipal;

public interface UserService {

    UserSummaryDto getCurrentUser(UserPrincipal principal);

    UserSummaryDto updateCurrentUserProfile(UserPrincipal principal, UpdateProfileRequest request);

    User findUserById(Long id);

    User findUserByUsername(String username);
}
