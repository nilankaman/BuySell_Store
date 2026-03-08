package com.buysell.config;

import com.buysell.model.Product;
import com.buysell.model.User;
import com.buysell.repository.ProductRepository;
import com.buysell.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) seedAdmin();
        if (productRepository.count() == 0) seedProducts();
    }

    private void seedAdmin() {
        userRepository.save(User.builder()
                .firstName("Admin").lastName("BuySell")
                .email("admin@buysell.com")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .active(true)
                .build());
        log.info("Admin account ready! Email: admin@buysell.com | Password: admin123");
    }

    private void seedProducts() {
        List<Product> products = List.of(
            Product.builder()
                .name("Nike Air Max 270").category("sneakers")
                .description("Lightweight with Max Air heel cushioning. A go-to for all-day comfort.")
                .price(14800.0)
                .oldPrice(18000.0)
                .discount(18)
                .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600")
                .badge("sale")
                .stock(50)
                .rating(4.8)
                .reviewCount(342)
                .colors("Black,White,Red,Blue")
                .sizes("25,25.5,26,26.5,27,27.5,28,28.5,29")
                .build(),

            Product.builder()
                .name("Sony WH-1000XM5")
                .category("electronics")
                .description("Best-in-class noise cancelling with 30hr battery and multipoint Bluetooth.")
                .price(39800.0)
                .oldPrice(44000.0)
                .discount(10)
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600")
                .badge("bestseller")
                .stock(30)
                .rating(4.9)
                .reviewCount(1205)
                .colors("Black,Silver")
                .build(),

            Product.builder()
                .name("Levi's 501 Original Jeans")
                .category("clothing")
                .description("The original straight fit since 1873. 100% cotton with button fly.")
                .price(8900.0)
                .oldPrice(11000.0)
                .discount(19)
                .imageUrl("https://images.unsplash.com/photo-1542272604-787c3835535d?w=600")
                .badge("sale")
                .stock(80)
                .rating(4.6)
                .reviewCount(892)
                .colors("Indigo,Black,Light Blue")
                .sizes("28,30,32,34,36")
                .build(),

            Product.builder()
                .name("Apple AirPods Pro 2")
                .category("electronics")
                .description("ANC, Adaptive Audio, and MagSafe USB-C case. The complete package.")
                .price(29800.0)
                .imageUrl("https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600")
                .badge("new")
                .stock(45)
                .rating(4.9)
                .reviewCount(2341)
                .colors("White")
                .build(),

            Product.builder()
                .name("Uniqlo Ultra Light Down Jacket")
                .category("clothing")
                .description("Packs into its own pocket. Insanely warm for the weight. Travel essential.")
                .price(6990.0)
                .oldPrice(8990.0)
                .discount(22)
                .imageUrl("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600")
                .badge("sale")
                .stock(120)
                .rating(4.7)
                .reviewCount(654)
                .colors("Black,Navy,Olive,Burgundy,Gray")
                .sizes("XS,S,M,L,XL,XXL")
                .build(),

            Product.builder()
                .name("Adidas Ultraboost 23")
                .category("sneakers")
                .description("Primeknit+ upper meets Boost midsole. The best running shoe Adidas makes.")
                .price(19800.0)
                .imageUrl("https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600")
                .badge("new")
                .stock(35)
                .rating(4.7)
                .reviewCount(487)
                .colors("Core Black,Cloud White,Lucid Blue")
                .sizes("25,26,27,28,29")
                .build(),

            Product.builder()
                .name("Anker MagGo Power Bank 10K")
                .category("electronics")
                .description("10,000mAh MagSafe-compatible with 20W USB-C. Thin, fast, travel-friendly.")
                .price(7980.0)
                .oldPrice(9800.0)
                .discount(19)
                .imageUrl("https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600")
                .badge("sale")
                .stock(200)
                .rating(4.5)
                .reviewCount(321)
                .colors("Black,White")
                .build(),

            Product.builder()
                .name("Champion Reverse Weave Hoodie").category("clothing")
                .description("Reverse weave construction fights shrinkage. Built to last, looks better with age.")
                .price(5900.0)
                .imageUrl("https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600")
                .badge("new")
                .stock(90)
                .rating(4.5)
                .reviewCount(289)
                .colors("Gray,Black,Navy,Green,Red")
                .sizes("XS,S,M,L,XL,XXL")
                .build(),

            Product.builder()
                .name("Converse Chuck Taylor All Star")
                .category("sneakers")
                .description("The canvas sneaker that never goes out of style. Simple. Iconic. Timeless.")
                .price(6900.0)
                .oldPrice(8200.0)
                .discount(16)
                .imageUrl("https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600")
                .badge("sale")
                .stock(150)
                .rating(4.4)
                .reviewCount(1102)
                .colors("Black,White,Red,Navy")
                .sizes("23,24,25,26,27,28")
                .build(),

            Product.builder()
                .name("Kindle Paperwhite 11th Gen")
                .category("electronics")
                .description("6.8\" display, warm adjustable light, waterproof, 3-month battery. Just read.")
                .price(17980.0)
                .imageUrl("https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600")
                .badge("bestseller")
                .stock(60)
                .rating(4.8)
                .reviewCount(945)
                .colors("Black,Denim")
                .build()

                // more products.
        );

        productRepository.saveAll(products);
        log.info("Successfully added {} products to the store. Your shop is looking alive!", products.size());
    }
}
