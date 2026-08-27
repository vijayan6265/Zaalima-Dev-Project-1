package com.ecommerce.order_service.service;

import com.ecommerce.order_service.dto.StockReduceEvent;

import com.ecommerce.order_service.dto.ProductResponse;
import com.ecommerce.order_service.dto.UserResponse;

import com.ecommerce.order_service.entity.Order;
import com.ecommerce.order_service.repository.OrderRepository;

import com.ecommerce.order_service.dto.OrderCreatedEvent;
import com.ecommerce.order_service.dto.OrderStatusEvent;

import org.springframework.kafka.core.KafkaTemplate;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;


@Service
public class OrderService {

    private final OrderRepository repository;

    private final RestClient restClient;

    private final RestClient userRestClient;

    private final KafkaTemplate<String, String> kafkaTemplate;


    public OrderService(
        OrderRepository repository,
        RestClient.Builder restClientBuilder,
        KafkaTemplate<String, String> kafkaTemplate
) {
    this.repository = repository;

    this.restClient =
            restClientBuilder
                    .baseUrl("http://localhost:8082")
                    .build();
                    
    this.userRestClient =
            restClientBuilder
                    .baseUrl("http://localhost:8081")
                    .build();


    this.kafkaTemplate = kafkaTemplate;
}


    // ==========================================
    // CREATE ORDER
    // ==========================================


    public Order createOrder(Order order) {


        UserResponse user =
        userRestClient
                .get()
                .uri(
                        "/api/users/{id}",
                        order.getUserId()
                )
                .retrieve()
                .body(UserResponse.class);

            if (user == null) {

                throw new RuntimeException(
                        "User not found"
                );
            }
        // Product Service-la product fetch pannuvom

        ProductResponse product =
                restClient
                        .get()
                        .uri(
                            "/api/products/{id}",
                            order.getProductId()
                        )
                        .retrieve()
                        .body(ProductResponse.class);


        if (product == null) {

            throw new RuntimeException(
                    "Product not found"
            );
        }


        // Check stock

        if ( product.getQuantity() < order.getQuantity ()) {

            throw new RuntimeException(
                    "Insufficient product stock"
            );
        }


        // Calculate total price

        double totalPrice =
                product.getPrice() * order.getQuantity();


        order.setTotalPrice( totalPrice );


        // Initial status

        order.setStatus( "PENDING" );

        Order savedOrder = repository.save(order);

    

        OrderCreatedEvent event =
        new OrderCreatedEvent(
                savedOrder.getId(),
                savedOrder.getUserId(),
                user.getEmail(),
                savedOrder.getProductId(),
                savedOrder.getQuantity(),
                savedOrder.getTotalPrice(),
                savedOrder.getStatus()
        );


        String eventJson;


        try {
            eventJson = new tools.jackson.databind.ObjectMapper()
                    .writeValueAsString(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert order event to JSON", e);
        }

        kafkaTemplate.send(
                "order-created",
                String.valueOf(savedOrder.getId()),
                eventJson
        );


        // kafkaTemplate.send(
        //         "order-confirmed",
        //         String.valueOf(savedOrder.getId()),
        //         eventJson
        // );

                    // ==========================================
            // STOCK REDUCE EVENT
            // ==========================================

            StockReduceEvent stockEvent =
                    new StockReduceEvent(
                            savedOrder.getProductId(),
                            savedOrder.getQuantity()
                    );


            String stockEventJson;

            try {

                stockEventJson =
                        new tools.jackson.databind.ObjectMapper()
                                .writeValueAsString(stockEvent);

            } catch (Exception e) {

                throw new RuntimeException(
                        "Failed to convert stock event to JSON",
                        e
                );
            }


            kafkaTemplate.send(
                    "stock-reduce",
                    String.valueOf(savedOrder.getProductId()),
                    stockEventJson
            );


return savedOrder;
    }


    // ==========================================
    // GET ALL ORDERS
    // ==========================================


    public List<Order> getAllOrders() {

        return repository.findAll();
    }


    // ==========================================
    // GET ORDER BY ID
    // ==========================================

    public Optional<Order> getOrderById(Long id) {

        return repository.findById(id);
    }

    // ==========================================
// UPDATE ORDER STATUS
// ==========================================

public Order updateOrderStatus(Long id, String status) {

    Optional<Order> optionalOrder =
            repository.findById(id);

    if (optionalOrder.isEmpty()) {
        throw new RuntimeException("Order not found");
    }

    Order order = optionalOrder.get();

    String currentStatus = order.getStatus();

    // ==========================================
    // VALID STATUS CHECK
    // ==========================================

    if (!status.equals("CONFIRMED")
            && !status.equals("SHIPPED")
            && !status.equals("DELIVERED")
            && !status.equals("CANCELLED")) {

        throw new RuntimeException(
                "Invalid order status"
        );
    }


    // ==========================================
    // STATUS TRANSITION CHECK
    // ==========================================

    boolean validTransition = false;


    if (currentStatus.equals("PENDING")
            && (status.equals("CONFIRMED")
            || status.equals("CANCELLED"))) {

        validTransition = true;
    }


    else if (currentStatus.equals("CONFIRMED")
            && (status.equals("SHIPPED")
            || status.equals("CANCELLED"))) {

        validTransition = true;
    }


    else if (currentStatus.equals("SHIPPED")
            && status.equals("DELIVERED")) {

        validTransition = true;
    }


    if (!validTransition) {

        throw new RuntimeException(
                "Invalid status transition from "
                + currentStatus
                + " to "
                + status
        );
    }


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    order.setStatus(status);

    Order updatedOrder =
            repository.save(order);


    // ==========================================
    // GET USER EMAIL
    // ==========================================

    UserResponse user =
            userRestClient
                    .get()
                    .uri(
                            "/api/users/{id}",
                            updatedOrder.getUserId()
                    )
                    .retrieve()
                    .body(UserResponse.class);


    if (user == null) {

        throw new RuntimeException(
                "User not found"
        );
    }


    // ==========================================
    // CREATE STATUS EVENT
    // ==========================================

    OrderStatusEvent event =
            new OrderStatusEvent(
                    updatedOrder.getId(),
                    updatedOrder.getUserId(),
                    user.getEmail(),
                    updatedOrder.getProductId(),
                    updatedOrder.getQuantity(),
                    updatedOrder.getTotalPrice(),
                    updatedOrder.getStatus()
            );


    String eventJson;

    try {

        eventJson =
                new tools.jackson.databind.ObjectMapper()
                        .writeValueAsString(event);

    } catch (Exception e) {

        throw new RuntimeException(
                "Failed to convert order status event to JSON",
                e
        );
    }


    // ==========================================
    // SEND KAFKA EVENT
    // ==========================================

    kafkaTemplate.send(
            "order-status-updated",
            String.valueOf(updatedOrder.getId()),
            eventJson
    );


    return updatedOrder;
}


    // ==========================================
    // DELETE ORDER
    // ==========================================

    public void deleteOrder(Long id) {

        if (!repository.existsById(id)) {

            throw new RuntimeException(
                    "Order not found"
            );
        }

        repository.deleteById(id);
    }
}