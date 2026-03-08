package com.buysell.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlaceOrderRequest {
    @NotBlank private String shippingAddress;
    @NotBlank private String shippingCity;
    @NotBlank private String shippingPostalCode;
    private String paymentMethod = "CREDIT_CARD";
}
