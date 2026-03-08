package com.buysell.ai;

import com.buysell.model.Product;
import com.buysell.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiService {

    @Value("${huggingface.api.key}")
    private String apiKey;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String API_URL =
        "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.1/v1/chat/completions";

    private String callAIService(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "mistralai/Mistral-7B-Instruct-v0.1");
            body.put("messages", List.of(message));
            body.put("max_tokens", 150);
            body.put("temperature", 0.85);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(API_URL, request, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            if (root.has("choices") && root.get("choices").size() > 0) {
                String reply = root.get("choices").get(0).get("message").get("content").asText().trim();
                // strip any [INST] tokens Mistral sometimes echoes back
                reply = reply.replaceAll("\\[/?INST\\]", "").trim();
                return reply;
            }

            return smartFallback(prompt);

        } catch (Exception e) {
            return smartFallback(prompt);
        }
    }

    private String smartFallback(String prompt) {
        String p = prompt.toLowerCase();
        if (p.contains("sneak") || p.contains("shoe") || p.contains("boot") || p.contains("footwear"))
            return "Yeah we've got a solid sneaker lineup — Nike, Adidas, and a few others. Worth checking the Shop page.";
        if (p.contains("cloth") || p.contains("shirt") || p.contains("jacket") || p.contains("hoodie") || p.contains("jean"))
            return "We carry Uniqlo, Levi's, Champion — pretty decent range. Hit the clothing filter in the shop.";
        if (p.contains("electro") || p.contains("headphone") || p.contains("airpod") || p.contains("speaker") || p.contains("phone"))
            return "For electronics we've got Sony, Apple AirPods, Anker power banks. Check the electronics section.";
        if (p.contains("price") || p.contains("cheap") || p.contains("sale") || p.contains("discount"))
            return "There's a sale filter on the Shop page — some good deals there right now.";
        if (p.contains("hello") || p.contains("hi") || p.contains("hey") || p.contains("helo") || p.contains("sup"))
            return "Hey! Looking for something specific or just browsing?";
        if (p.contains("order") || p.contains("track") || p.contains("deliver") || p.contains("ship"))
            return "You can check your order status under 'My Orders' once you're logged in.";
        if (p.contains("return") || p.contains("refund") || p.contains("exchange"))
            return "For returns just reach out with your order number and we'll sort it out.";
        if (p.contains("cart") || p.contains("checkout") || p.contains("buy") || p.contains("purchase"))
            return "Add it to your cart and checkout — we take PayPay, credit cards, and cash on delivery.";
        if (p.contains("account") || p.contains("login") || p.contains("register") || p.contains("sign"))
            return "There's a login button at the top right — takes about 30 seconds to set up an account.";
        if (p.contains("recommend") || p.contains("suggest") || p.contains("best") || p.contains("popular"))
            return "Honestly the Sony headphones and Nike Air Max are our top sellers right now. Both worth it.";
        return "Not sure I follow — could you be a bit more specific? I can help with products, orders, or anything else.";
    }

    public String handleChat(String userMessage) {
        List<Product> products = productRepository.findAll();
        StringBuilder catalog = new StringBuilder();
        products.stream().limit(20).forEach(p ->
            catalog.append("- ").append(p.getName())
                   .append(" (").append(p.getCategory()).append(")")
                   .append(", ¥").append(p.getPrice())
                   .append(p.getBadge() != null ? ", " + p.getBadge() : "")
                   .append("\n")
        );

        String prompt = "[INST] You are a chill, helpful store assistant named Kai working at BuySell — an online store in Japan. " +
                "You talk like a real person: casual, short sentences, no corporate speak, no exclamation marks every sentence. " +
                "Never say things like 'Great choice!' or 'Absolutely!' or 'Certainly!'. " +
                "Just be natural and helpful. Keep your reply to 2-3 sentences max.\n\n" +
                "Here's what we currently sell:\n" + catalog + "\n" +
                "Customer message: \"" + userMessage + "\" [/INST]";

        return callAIService(prompt);
    }

    public String createDescription(String productName, String category) {
        String prompt = "[INST] Write a short 2-sentence product description for: " +
                productName + " (category: " + category + "). " +
                "Sound like a real person wrote it, not a marketer. No hype, just honest and clear. [/INST]";
        return callAIService(prompt);
    }

    public String searchProducts(String query) {
        List<Product> products = productRepository.findAll();
        StringBuilder catalog = new StringBuilder();
        products.forEach(p ->
            catalog.append("ID:").append(p.getId())
                   .append(" Name:").append(p.getName())
                   .append(" Category:").append(p.getCategory())
                   .append(" Price:").append(p.getPrice())
                   .append(" Badge:").append(p.getBadge()).append("\n")
        );

        String prompt = "[INST] Product catalog:\n" + catalog +
                "\nUser is searching for: \"" + query + "\"" +
                "\nReturn up to 6 matching product IDs as comma-separated numbers only. No explanation. [/INST]";
        return callAIService(prompt);
    }

    public List<Product> recommendProducts(Long productId) {
        Optional<Product> current = productRepository.findById(productId);
        if (current.isEmpty()) return List.of();

        List<Product> all = productRepository.findAll();
        String category = current.get().getCategory();

        String catalog = all.stream()
            .filter(p -> !p.getId().equals(productId))
            .map(p -> "ID:" + p.getId() + " Name:" + p.getName() +
                      " Category:" + p.getCategory() + " Price:" + p.getPrice())
            .reduce("", (a, b) -> a + "\n" + b);

        String prompt = "[INST] Products:\n" + catalog +
                "\nUser is viewing: " + current.get().getName() + " (" + category + ")" +
                "\nSuggest 4 related product IDs as comma-separated numbers only. No explanation. [/INST]";

        String result = callAIService(prompt);
        try {
            List<Long> ids = Arrays.stream(result.trim().split(","))
                    .map(s -> Long.parseLong(s.trim()))
                    .toList();
            return all.stream().filter(p -> ids.contains(p.getId())).toList();
        } catch (Exception e) {
            return all.stream()
                .filter(p -> p.getCategory().equals(category) && !p.getId().equals(productId))
                .limit(4).toList();
        }
    }
}