package com.buysell.ai;

import com.buysell.dto.ApiResponse;
import com.buysell.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/help")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiService aiService;
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<String>> handleChatMessage(@RequestBody AiRequest req) {
        String response = aiService.handleChat(req.getMessage());
        return ResponseEntity.ok(new ApiResponse<>(true, "Sucess", response));
    }
    @PostMapping("/generate-description")
    public ResponseEntity<ApiResponse<String>> createProductDescription(@RequestBody AiRequest req) {
        String description = aiService.createDescription(req.getProductName(), req.getCategory());
        return ResponseEntity.ok(new ApiResponse<>(true, "Description generated", description));
    }
    @GetMapping("/search")
    public ResponseEntity<?> aiSearch(@RequestParam String query) {
        String idList = aiService.searchProducts(query);
        return ResponseEntity.ok(new ApiResponse<>(true, "completed", idList));
    }

    @GetMapping("/recommendations/{productId}")
    public ResponseEntity<?> recommendations(@PathVariable Long productId) {
        List<Product> products = aiService.recommendProducts(productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ready", products));
    }
}