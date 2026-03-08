package com.buysell.repository;

import com.buysell.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryIgnoreCaseAndActiveTrue(String category);
    List<Product> findByBadgeAndActiveTrue(String badge);
    List<Product> findByActiveTrue();
    List<Product> findTop8ByActiveTrueOrderByRatingDesc();

    @Query("SELECT p FROM Product p WHERE p.active = true AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Product> search(@Param("q") String query);
}
