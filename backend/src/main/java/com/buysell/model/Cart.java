package com.buysell.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "cart_id")
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Transient
    public Double getTotalAmount() {
        return items.stream().mapToDouble(CartItem::getSubtotal).sum();
    }

    @Transient
    public int getTotalItems() {
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }

    @Transient
    public Double getShippingCost() {
        return getTotalAmount() >= 5000 ? 0.0 : 800.0;
    }

    @Transient
    public Double getGrandTotal() {
        return getTotalAmount() + getShippingCost();
    }
}
