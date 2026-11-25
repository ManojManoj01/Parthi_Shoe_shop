package com.stepstyle.service;

import com.stepstyle.dto.ReviewRequestDto;
import com.stepstyle.dto.ReviewResponseDto;

import java.util.List;

public interface ReviewService {

    ReviewResponseDto addReview(Long productId, ReviewRequestDto requestDto);

    List<ReviewResponseDto> getReviewsByProductId(Long productId);
}
