package com.buysell.controller;

import com.buysell.dto.ApiResponse;
import com.buysell.dto.PlaceOrderRequest;
import com.buysell.model.Order;
import com.buysell.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> placeOrder(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody PlaceOrderRequest req) {
        Order order = orderService.placeOrder(user.getUsername(), req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed! #" + order.getOrderNumber(), order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> myOrders(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(user.getUsername())));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getByOrderNumber(orderNumber)));
    }

    @PostMapping("/{orderNumber}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancel(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled.", orderService.cancel(orderNumber, user.getUsername())));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Order>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));

        Order.OrderStatus status;
        try {
            status = Order.OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid status: " + statusStr));
        }

        return ResponseEntity.ok(ApiResponse.success("Status updated successfully.", orderService.updateStatus(id, status)));
    }
}