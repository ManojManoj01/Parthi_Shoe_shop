package com.stepstyle.controller;

import com.stepstyle.dto.ReviewRequestDto;
import com.stepstyle.dto.ReviewResponseDto;
import com.stepstyle.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@Tag(name = "Product Reviews", description = "Customer review and star rating endpoints")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @Operation(summary = "Submit customer review", description = "Submits a 1-5 star rating and comment for a product, updating the product rating")
    public ResponseEntity<ReviewResponseDto> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequestDto requestDto) {
        ReviewResponseDto created = reviewService.addReview(productId, requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get product reviews", description = "Returns all customer reviews and ratings for a product")
    public ResponseEntity<List<ReviewResponseDto>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }
}
