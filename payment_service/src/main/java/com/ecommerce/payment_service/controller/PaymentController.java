package com.ecommerce.payment_service.controller;

import com.ecommerce.payment_service.dto.PaymentRequest;
import com.ecommerce.payment_service.dto.PaymentVerificationRequest;
import com.ecommerce.payment_service.dto.RazorpayOrderResponse;
import com.ecommerce.payment_service.entity.Payment;
import com.ecommerce.payment_service.service.PaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    @PostMapping("/create-order")
    public ResponseEntity<RazorpayOrderResponse> createOrder(
            @RequestBody PaymentRequest request
    ) {

        RazorpayOrderResponse response =
                service.createRazorpayOrder(request);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // VERIFY PAYMENT
    // ==========================================

    @PostMapping("/verify")
    public ResponseEntity<Payment> verifyPayment(
            @RequestBody PaymentVerificationRequest request
    ) {

        Payment payment =
                service.verifyPayment(request);

        return ResponseEntity.ok(payment);
    }

    // ==========================================
    // GET PAYMENT
    // ==========================================

    @GetMapping("/{id}")
        public ResponseEntity<Payment> getPayment(
                @PathVariable Long id
        ) {
        try {

                Payment payment =
                        service.getPayment(id);

                return ResponseEntity.ok(payment);

        } catch (RuntimeException e) {

                return ResponseEntity.notFound().build();
        }
        }
}