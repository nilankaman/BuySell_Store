package com.buysell.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @Min(1)
    private Integer quantity = 1;

    private String selectedColor;
    private String selectedSize;
}
