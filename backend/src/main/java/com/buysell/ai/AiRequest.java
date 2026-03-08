package com.buysell.ai;

import lombok.Data;

@Data
public class AiRequest {
    private String message;
    private String productName;
    private String category;
    private Long productId;
}