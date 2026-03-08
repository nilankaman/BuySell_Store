package com.buysell.controller;

import com.buysell.dto.ApiResponse;
import com.buysell.model.WishlistItem;
import com.buysell.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItem>>> getWishlist(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlist(user.getUsername())));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistItem>> add(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist.", wishlistService.addToWishlist(user.getUsername(), productId)));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist.", null));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> check(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        boolean saved = wishlistService.isInWishlist(user.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("inWishlist", saved)));
    }
}