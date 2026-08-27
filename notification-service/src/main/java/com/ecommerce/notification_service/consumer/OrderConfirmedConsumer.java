// package com.ecommerce.notification_service.consumer;

// import com.ecommerce.notification_service.service.EmailService;

// import org.springframework.kafka.annotation.KafkaListener;
// import org.springframework.stereotype.Service;

// @Service
// public class OrderConfirmedConsumer {

//     private final EmailService emailService;

//     @KafkaListener(
//             topics = "order-confirmed",
//             groupId = "notification-confirmed-service"
//     )
//     public void consumeOrderConfirmed(String message) {

//         System.out.println("=================================");
//         System.out.println("✅ ORDER CONFIRMED EVENT");
//         System.out.println("=================================");

//         System.out.println(message);

//         System.out.println("---------------------------------");
//         System.out.println("📧 Notification:");
//         System.out.println("Your order has been confirmed successfully!");

//         System.out.println("=================================");
//         emailService.sendOrderEmail(
//                             "vijayanad01@gmail.com",
//                             "Order Confirmed - Ecommerce",
//                             "Your order has been confirmed successfully!\n\n"
//                                     + "Order Details:\n"
//                                     + message
//         );
//     }

//     public OrderConfirmedConsumer(EmailService emailService) {
//     this.emailService = emailService;
// }
// }