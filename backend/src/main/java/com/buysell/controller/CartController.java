package com.buysell.controller;

import com.buysell.dto.AddToCartRequest;
import com.buysell.dto.ApiResponse;
import com.buysell.model.Cart;
import com.buysell.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Here’s your current cart.", cartService.getCart(user.getUsername())));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Cart>> addItem(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Item has been added to your cart!", cartService.addItem(user.getUsername(), req)));
    }

    @PutMapping("/item/{id}")
    public ResponseEntity<ApiResponse<Cart>> updateQty(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer qty = body.get("quantity");
        if (qty == null) return ResponseEntity.badRequest().body(ApiResponse.error("Quantity is required to update the item."));
        return ResponseEntity.ok(ApiResponse.success("Quantity updated successfully.", cartService.updateQuantity(user.getUsername(), id, qty)));
    }

    @DeleteMapping("/item/{id}")
    public ResponseEntity<ApiResponse<Cart>> removeItem(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Item removed from your cart.", cartService.removeItem(user.getUsername(), id)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clear(@AuthenticationPrincipal UserDetails user) {
        cartService.clearCart(user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All done! Your cart has been cleared.", null));
    }
}