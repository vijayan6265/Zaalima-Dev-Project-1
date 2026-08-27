package com.ecommerce.notification_service.consumer;

import com.ecommerce.notification_service.service.EmailService;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class OrderStatusConsumer {

    private final EmailService emailService;

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    public OrderStatusConsumer(EmailService emailService) {
        this.emailService = emailService;
    }


    @KafkaListener(
            topics = "order-status-updated",
            groupId = "notification-status-service"
    )
    public void consumeOrderStatus(String message) {

        try {

            System.out.println("=================================");
            System.out.println("🔄 ORDER STATUS UPDATED");
            System.out.println("=================================");

            System.out.println("Order Event:");
            System.out.println(message);


            JsonNode json =
                    objectMapper.readTree(message);


            Long orderId =
                    json.get("id").asLong();

            Long userId =
                    json.get("userId").asLong();

            String status =
                    json.get("status").asText();

            Double totalPrice =
                    json.get("totalPrice").asDouble();


            // Customer email

            String customerEmail =
                    json.get("email").asText();


            // ==========================================
            // STATUS BASED EMAIL
            // ==========================================

            String subject;

            String messageText;


            switch (status) {

                case "CONFIRMED":

                    subject =
                            "Order Confirmed - Order #"
                            + orderId;

                    messageText =
                            "Hello,\n\n"
                            + "Great news! Your order has been confirmed successfully.\n\n"
                            + "Order Details:\n"
                            + "----------------------------\n"
                            + "Order ID    : " + orderId + "\n"
                            + "User ID     : " + userId + "\n"
                            + "Total Price : ₹" + totalPrice + "\n"
                            + "Status      : CONFIRMED\n"
                            + "----------------------------\n\n"
                            + "Your order is now confirmed and will be processed shortly.\n\n"
                            + "Thank you for shopping with us!\n\n"
                            + "Regards,\n"
                            + "E-Commerce Team";

                    break;


                case "SHIPPED":

                    subject =
                            "Order Shipped - Order #"
                            + orderId;

                    messageText =
                            "Hello,\n\n"
                            + "Your order has been shipped! 🚚\n\n"
                            + "Order Details:\n"
                            + "----------------------------\n"
                            + "Order ID    : " + orderId + "\n"
                            + "User ID     : " + userId + "\n"
                            + "Total Price : ₹" + totalPrice + "\n"
                            + "Status      : SHIPPED\n"
                            + "----------------------------\n\n"
                            + "Your order is on the way.\n\n"
                            + "Thank you for shopping with us!\n\n"
                            + "Regards,\n"
                            + "E-Commerce Team";

                    break;


                case "DELIVERED":

                    subject =
                            "Order Delivered - Order #"
                            + orderId;

                    messageText =
                            "Hello,\n\n"
                            + "Your order has been delivered successfully! 🎉\n\n"
                            + "Order Details:\n"
                            + "----------------------------\n"
                            + "Order ID    : " + orderId + "\n"
                            + "User ID     : " + userId + "\n"
                            + "Total Price : ₹" + totalPrice + "\n"
                            + "Status      : DELIVERED\n"
                            + "----------------------------\n\n"
                            + "We hope you enjoy your purchase!\n\n"
                            + "Thank you for shopping with us!\n\n"
                            + "Regards,\n"
                            + "E-Commerce Team";

                    break;


                case "CANCELLED":

                    subject =
                            "Order Cancelled - Order #"
                            + orderId;

                    messageText =
                            "Hello,\n\n"
                            + "Your order has been cancelled.\n\n"
                            + "Order Details:\n"
                            + "----------------------------\n"
                            + "Order ID    : " + orderId + "\n"
                            + "User ID     : " + userId + "\n"
                            + "Total Price : ₹" + totalPrice + "\n"
                            + "Status      : CANCELLED\n"
                            + "----------------------------\n\n"
                            + "If you did not request this cancellation, please contact our support team.\n\n"
                            + "Regards,\n"
                            + "E-Commerce Team";

                    break;


                default:

                    throw new RuntimeException(
                            "Unknown order status: " + status
                    );
            }


            // ==========================================
            // SEND EMAIL
            // ==========================================

            emailService.sendOrderEmail(
                    customerEmail,
                    subject,
                    messageText
            );


            System.out.println("---------------------------------");
            System.out.println(
                    "📧 " + status + " email sent!"
            );
            System.out.println(
                    "📩 Sent to: " + customerEmail
            );
            System.out.println("=================================");


        } catch (Exception e) {

            System.out.println(
                    "❌ Failed to process order-status-updated event"
            );

            e.printStackTrace();
        }
    }
}