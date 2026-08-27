package com.ecommerce.product_service.service;

import com.ecommerce.product_service.entity.Product;
import com.ecommerce.product_service.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository repository;


    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }


    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    public Product createProduct(Product product) {

        return repository.save(product);
    }


    // ==========================================
    // GET ALL PRODUCTS
    // ==========================================

    public List<Product> getAllProducts() {

        return repository.findAll();
    }


    // ==========================================
    // GET PRODUCT BY ID
    // ==========================================

    public Optional<Product> getProductById(Long id) {

        return repository.findById(id);
    }


    // ==========================================
    // UPDATE PRODUCT
    // ==========================================

    public Product updateProduct(
            Long id,
            Product updatedProduct
    ) {

        Product existingProduct =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Product not found"
                                )
                        );


        existingProduct.setName(
                updatedProduct.getName()
        );

        existingProduct.setDescription(
                updatedProduct.getDescription()
        );

        existingProduct.setPrice(
                updatedProduct.getPrice()
        );

        existingProduct.setQuantity(
                updatedProduct.getQuantity()
        );

        existingProduct.setCategory(
                updatedProduct.getCategory()
        );


        return repository.save(existingProduct);
    }

        // ==========================================
        // REDUCE PRODUCT STOCK
        // ==========================================

        public Product reduceStock(Long productId, Integer quantity) {

        Product product =
                repository.findById(productId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Product not found"
                                )
                        );

        if (quantity == null || quantity <= 0) {

        throw new RuntimeException(
                "Invalid quantity"
        );
        }

        if (product.getQuantity() < quantity) {

                throw new RuntimeException(
                        "Insufficient product stock"
                );
        }

        product.setQuantity(
                product.getQuantity() - quantity
        );

        return repository.save(product);
        }


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    public void deleteProduct(Long id) {

        if (!repository.existsById(id)) {

            throw new RuntimeException(
                    "Product not found"
            );
        }

        repository.deleteById(id);
    }
}