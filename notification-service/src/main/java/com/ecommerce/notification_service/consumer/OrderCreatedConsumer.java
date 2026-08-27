package com.ecommerce.notification_service.consumer;

import com.ecommerce.notification_service.service.EmailService;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class OrderCreatedConsumer {

    private final EmailService emailService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public OrderCreatedConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(
            topics = "order-created",
            groupId = "notification-service"
    )
    public void consumeOrderCreated(String message) {

        try {

            System.out.println("=================================");
            System.out.println("📦 NEW ORDER RECEIVED");
            System.out.println("=================================");

            System.out.println("Order Event:");
            System.out.println(message);

            JsonNode json =
                    objectMapper.readTree(message);

            Long orderId =
                    json.get("orderId").asLong();

            Long userId =
                    json.get("userId").asLong();

            Long productId =
                    json.get("productId").asLong();

            Integer quantity =
                    json.get("quantity").asInt();

            Double totalPrice =
                    json.get("totalPrice").asDouble();

            String status =
                    json.get("status").asText();


            // Customer email
            String customerEmail =
                        json.get("userEmail").asText();


            String subject =
                    "Order Placed Successfully - Order #" + orderId;


            String emailMessage =
                    "Hello,\n\n"
                    + "Your order has been successfully placed!\n\n"
                    + "Order Details:\n"
                    + "----------------------------\n"
                    + "Order ID   : " + orderId + "\n"
                    + "User ID    : " + userId + "\n"
                    + "Product ID : " + productId + "\n"
                    + "Quantity   : " + quantity + "\n"
                    + "Total Price: ₹" + totalPrice + "\n"
                    + "Status     : " + status + "\n"
                    + "----------------------------\n\n"
                    + "Thank you for shopping with us!\n\n"
                    + "Regards,\n"
                    + "E-Commerce Team";


            emailService.sendOrderEmail(
                    customerEmail,
                    subject,
                    emailMessage
            );


            System.out.println("---------------------------------");
            System.out.println("📧 Customer email sent!");
            System.out.println("=================================");


        } catch (Exception e) {

            System.out.println(
                    "❌ Failed to process order-created event"
            );

            e.printStackTrace();
        }
    }
}