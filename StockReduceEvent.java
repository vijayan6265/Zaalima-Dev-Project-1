package com.ecommerce.order_service.dto;

public class StockReduceEvent {

    private Long productId;
    private Integer quantity;


    public StockReduceEvent() {
    }


    public StockReduceEvent(
            Long productId,
            Integer quantity
    ) {
        this.productId = productId;
        this.quantity = quantity;
    }


    // Product ID

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }


    // Quantity

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
