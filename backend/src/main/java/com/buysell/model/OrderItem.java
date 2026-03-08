package com.buysell.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String productName;

    private String productImageUrl;
    private String productCategory;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    private String selectedColor;
    private String selectedSize;

    @Transient
    public Double getSubtotal() {
        return unitPrice * quantity;
    }

    // Takes a snapshot of the cart item so the order is never affected
    // if the product price changes later
    public static OrderItem fromCartItem(CartItem item) {
        Product p = item.getProduct();
        return OrderItem.builder()
                .productId(p.getId())
                .productName(p.getName())
                .productImageUrl(p.getImageUrl())
                .productCategory(p.getCategory())
                .unitPrice(p.getPrice())
                .quantity(item.getQuantity())
                .selectedColor(item.getSelectedColor())
                .selectedSize(item.getSelectedSize())
                .build();
    }
}
