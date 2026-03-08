package com.buysell.service;

import com.buysell.dto.AddToCartRequest;
import com.buysell.exception.ResourceNotFoundException;
import com.buysell.model.*;
import com.buysell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Cart getCart(String email) {
        User user = getUser(email);
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    @Transactional
    public Cart addItem(String email, AddToCartRequest req) {
        Cart cart = getCart(email);

        Product product = productRepository.findById(req.getProductId())
                .filter(p -> p.getActive())
                .orElseThrow(() -> new ResourceNotFoundException("Product", req.getProductId()));

        if (product.getStock() < req.getQuantity()) {
            throw new IllegalArgumentException("Only " + product.getStock() + " left in stock");
        }

        // If same product + same color + same size already in cart, just increase qty
        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(req.getProductId())
                    && matches(i.getSelectedColor(), req.getSelectedColor())
                    && matches(i.getSelectedSize(), req.getSelectedSize()))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + req.getQuantity());
        } else {
            cart.getItems().add(CartItem.builder()
                    .product(product)
                    .quantity(req.getQuantity())
                    .selectedColor(req.getSelectedColor())
                    .selectedSize(req.getSelectedSize())
                    .build());
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateQuantity(String email, Long itemId, int qty) {
        Cart cart = getCart(email);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (qty <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(qty);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(String email, Long itemId) {
        Cart cart = getCart(email);
        boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) throw new ResourceNotFoundException("Cart item not found");
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = getCart(email);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User: " + email));
    }

    private boolean matches(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equalsIgnoreCase(b);
    }
}
