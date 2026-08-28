package com.ecommerce.product_service.controller;

import com.ecommerce.product_service.entity.Product;
import com.ecommerce.product_service.service.ProductService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;


    public ProductController(ProductService service) {
        this.service = service;
    }


    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product
    ) {

        Product createdProduct =
                service.createProduct(product);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdProduct);
    }


    // ==========================================
    // GET ALL PRODUCTS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                service.getAllProducts()
        );
    }


    // ==========================================
    // GET PRODUCT BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id
    ) {

        Optional<Product> product =
                service.getProductById(id);


        if (product.isPresent()) {

            return ResponseEntity.ok(
                    product.get()
            );
        }


        return ResponseEntity
                .notFound()
                .build();
    }


    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ) {

        Product updatedProduct =
                service.updateProduct(
                        id,
                        product
                );

        return ResponseEntity.ok(
                updatedProduct
        );
    }


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id
    ) {

        service.deleteProduct(id);

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }
}
