package com.stepstyle.service.impl;

import com.stepstyle.dto.ReviewRequestDto;
import com.stepstyle.dto.ReviewResponseDto;
import com.stepstyle.entity.Product;
import com.stepstyle.entity.Review;
import com.stepstyle.exception.ResourceNotFoundException;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.repository.ReviewRepository;
import com.stepstyle.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ReviewResponseDto addReview(Long productId, ReviewRequestDto requestDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Review review = new Review(
                product,
                requestDto.getReviewerName().trim(),
                requestDto.getRating(),
                requestDto.getComment().trim()
        );
        Review saved = reviewRepository.save(review);

        // Recalculate average rating directly from actual customer reviews
        Double avg = reviewRepository.calculateAverageRatingByProductId(productId);
        double roundedRating = 0.0;
        if (avg != null) {
            roundedRating = BigDecimal.valueOf(avg)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        product.setRating(roundedRating);
        productRepository.save(product);

        long totalReviews = reviewRepository.countByProductId(productId);

        return new ReviewResponseDto(
                saved.getId(),
                productId,
                saved.getReviewerName(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt(),
                roundedRating,
                totalReviews
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByProductId(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        Product product = productRepository.findById(productId).orElse(null);
        Double currentRating = product != null ? product.getRating() : 0.0;
        long totalReviews = reviewRepository.countByProductId(productId);

        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(r -> new ReviewResponseDto(
                        r.getId(),
                        productId,
                        r.getReviewerName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt(),
                        currentRating,
                        totalReviews
                ))
                .collect(Collectors.toList());
    }
}
