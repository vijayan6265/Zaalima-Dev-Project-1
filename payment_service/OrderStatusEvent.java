package com.ecommerce.order_service.dto;

public class OrderStatusEvent {

    private Long id;
    private Long userId;
    private String email;
    private Long productId;
    private Integer quantity;
    private Double totalPrice;
    private String status;

    public OrderStatusEvent(
            Long id,
            Long userId,
            String email,
            Long productId,
            Integer quantity,
            Double totalPrice,
            String status
    ) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.productId = productId;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public Long getProductId() {
        return productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public String getStatus() {
        return status;
    }
}