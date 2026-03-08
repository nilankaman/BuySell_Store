package com.buysell.service;

import com.buysell.exception.ResourceNotFoundException;
import com.buysell.model.Product;
import com.buysell.model.User;
import com.buysell.model.WishlistItem;
import com.buysell.repository.ProductRepository;
import com.buysell.repository.UserRepository;
import com.buysell.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<WishlistItem> getWishlist(String email) {
        User user = getUser(email);
        return wishlistRepository.findByUserId(user.getId());
    }

    @Transactional
    public WishlistItem addToWishlist(String email, Long productId) {
        User user = getUser(email);

        Product product = productRepository.findById(productId)
                .filter(p -> p.getActive())
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        // Already in wishlist? Just return it
        return wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseGet(() -> wishlistRepository.save(
                    WishlistItem.builder()
                        .userId(user.getId())
                        .product(product)
                        .build()
                ));
    }

    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        User user = getUser(email);
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    public boolean isInWishlist(String email, Long productId) {
        User user = getUser(email);
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User: " + email));
    }
}
