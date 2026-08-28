package com.ecommerce.order_service.controller;

import com.ecommerce.order_service.entity.Order;
import com.ecommerce.order_service.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;


    public OrderController(OrderService service) {
        this.service = service;
    }


    // ==========================================
    // CREATE ORDER
    // ==========================================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody Order order
    ) {

        Order createdOrder =
                service.createOrder(order);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdOrder);
    }


    // ==========================================
    // GET ALL ORDERS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        return ResponseEntity.ok(
                service.getAllOrders()
        );
    }


    // ==========================================
    // GET ORDER BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id
    ) {

        Optional<Order> order =
                service.getOrderById(id);

        if (order.isPresent()) {

            return ResponseEntity.ok(
                    order.get()
            );
        }

        return ResponseEntity
                .notFound()
                .build();
    }

    @PutMapping("/{id}/status")
public Order updateOrderStatus(
        @PathVariable Long id,
        @RequestParam String status
) {

    return service.updateOrderStatus(id, status);
}


    // ==========================================
    // DELETE ORDER
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(
            @PathVariable Long id
    ) {

        service.deleteOrder(id);

        return ResponseEntity.ok(
                "Order deleted successfully"
        );
    }
}