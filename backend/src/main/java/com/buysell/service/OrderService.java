package com.buysell.service;

import com.buysell.dto.PlaceOrderRequest;
import com.buysell.exception.ResourceNotFoundException;
import com.buysell.model.*;
import com.buysell.repository.OrderRepository;
import com.buysell.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ProductService productService;

    @Transactional
    public Order placeOrder(String email, PlaceOrderRequest req) {
        User user = getUser(email);
        Cart cart = cartService.getCart(email);

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Your cart is empty");
        }

        Order.PaymentMethod paymentMethod;
        try {
            paymentMethod = Order.PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment method: " + req.getPaymentMethod());
        }

        // Reduce stock for each item before clearing cart
        for (CartItem item : cart.getItems()) {
            productService.reduceStock(item.getProduct().getId(), item.getQuantity());
        }

        // Snapshot the cart items into order items (separate table, separate records)
        List<OrderItem> orderItems = cart.getItems().stream()
                .map(OrderItem::fromCartItem)
                .collect(Collectors.toList());

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .items(orderItems)
                .subtotal(cart.getTotalAmount())
                .shippingCost(cart.getShippingCost())
                .totalAmount(cart.getGrandTotal())
                .shippingAddress(req.getShippingAddress())
                .shippingCity(req.getShippingCity())
                .shippingPostalCode(req.getShippingPostalCode())
                .paymentMethod(paymentMethod)
                .status(Order.OrderStatus.CONFIRMED)
                .build();

        Order saved = orderRepository.save(order);
        cartService.clearCart(email); // clear cart only after order is saved

        log.info("Order {} placed by {}", saved.getOrderNumber(), email);
        return saved;
    }

    public List<Order> getUserOrders(String email) {
        User user = getUser(email);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Order getByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));
    }

    @Transactional
    public Order cancel(String orderNumber, String email) {
        Order order = getByOrderNumber(orderNumber);

        if (!order.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("You can only cancel your own orders");
        }
        if (order.getStatus() == Order.OrderStatus.SHIPPED ||
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel: order is already " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User: " + email));
    }

    private String generateOrderNumber() {
        String num;
        do {
            num = "BS-" + (100000 + new Random().nextInt(900000));
        } while (orderRepository.findByOrderNumber(num).isPresent());
        return num;
    }
}

