package com.ecommerce.product_service.consumer;

import com.ecommerce.product_service.service.ProductService;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class ProductStockConsumer {

    private final ProductService productService;

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    public ProductStockConsumer(ProductService productService) {
        this.productService = productService;
    }


    @KafkaListener(
            topics = "stock-reduce",
            groupId = "product-stock-service"
    )
    public void consumeStockReduce(String message) {

        try {

            System.out.println("=================================");
            System.out.println("📦 STOCK REDUCE EVENT");
            System.out.println("=================================");

            System.out.println("Stock Event:");
            System.out.println(message);


            JsonNode json =
                    objectMapper.readTree(message);


            Long productId =
                    json.get("productId").asLong();

            Integer quantity =
                    json.get("quantity").asInt();


            // ==========================================
            // REDUCE PRODUCT STOCK
            // ==========================================

            productService.reduceStock(
                    productId,
                    quantity
            );


            System.out.println("---------------------------------");
            System.out.println(
                    "✅ Stock reduced successfully"
            );
            System.out.println(
                    "Product ID : " + productId
            );
            System.out.println(
                    "Quantity   : " + quantity
            );
            System.out.println("=================================");


        } catch (Exception e) {

            System.out.println(
                    "❌ Failed to reduce product stock"
            );

            e.printStackTrace();
        }
    }
}