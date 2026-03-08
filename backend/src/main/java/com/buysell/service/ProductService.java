package com.buysell.service;

import com.buysell.exception.ResourceNotFoundException;
import com.buysell.model.Product;
import com.buysell.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAll() {
        return productRepository.findByActiveTrue();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .filter(p -> p.getActive())
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    public List<Product> search(String query) {
        return productRepository.search(query.trim());
    }

    public List<Product> getByCategory(String category) {
        return productRepository.findByCategoryIgnoreCaseAndActiveTrue(category);
    }

    public List<Product> getByBadge(String badge) {
        return productRepository.findByBadgeAndActiveTrue(badge);
    }

    public List<Product> getTopRated() {
        return productRepository.findTop8ByActiveTrueOrderByRatingDesc();
    }

    @Transactional
    public Product create(Product product) {
        // Auto-calculate discount if old price is given
        if (product.getOldPrice() != null && product.getOldPrice() > 0 && product.getPrice() != null) {
            int disc = (int) Math.round((1 - product.getPrice() / product.getOldPrice()) * 100);
            product.setDiscount(disc);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id, Product updated) {
        Product existing = getById(id);
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setOldPrice(updated.getOldPrice());
        existing.setDiscount(updated.getDiscount());
        existing.setImageUrl(updated.getImageUrl());
        existing.setBadge(updated.getBadge());
        existing.setStock(updated.getStock());
        existing.setColors(updated.getColors());
        existing.setSizes(updated.getSizes());
        return productRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Product product = getById(id);
        product.setActive(false); // soft delete
        productRepository.save(product);
    }

    @Transactional
    public void reduceStock(Long productId, int quantity) {
        Product product = getById(productId);
        if (product.getStock() < quantity) {
            throw new IllegalArgumentException(
                "Not enough stock for " + product.getName() +
                " (available: " + product.getStock() + ")");
        }
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }
}


