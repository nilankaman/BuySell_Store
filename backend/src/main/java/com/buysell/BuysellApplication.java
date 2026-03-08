package com.buysell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BuysellApplication {
    public static void main(String[] args) {
        SpringApplication.run(BuysellApplication.class, args);
        System.out.println("\n=========================================");
        System.out.println("  BuySell is running → http://localhost:8081");
        System.out.println("=========================================\n");
    }
}
