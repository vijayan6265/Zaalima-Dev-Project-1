package com.ecommerce.payment_service.service;

import com.ecommerce.payment_service.dto.PaymentRequest;
import com.ecommerce.payment_service.dto.PaymentVerificationRequest;
import com.ecommerce.payment_service.dto.PaymentSuccessEvent;
import com.ecommerce.payment_service.dto.RazorpayOrderResponse;
import com.ecommerce.payment_service.entity.Payment;
import com.ecommerce.payment_service.repository.PaymentRepository;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository repository;
    private final PaymentKafkaProducer kafkaProducer;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;


    public PaymentService(
            PaymentRepository repository,
            PaymentKafkaProducer kafkaProducer
    ) {
        this.repository = repository;
        this.kafkaProducer = kafkaProducer;
    }


    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    public RazorpayOrderResponse createRazorpayOrder(
            PaymentRequest request
    ) {

        try {

            // ==========================================
            // CREATE RAZORPAY CLIENT
            // ==========================================

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );


            // ==========================================
            // CONVERT RUPEES TO PAISE
            // ==========================================

            long amountInPaise =
                    Math.round(
                            request.getAmount() * 100
                    );


            // ==========================================
            // RAZORPAY ORDER REQUEST
            // ==========================================

            JSONObject orderRequest =
                    new JSONObject();


            orderRequest.put(
                    "amount",
                    amountInPaise
            );


            orderRequest.put(
                    "currency",
                    "INR"
            );


            orderRequest.put(
                    "receipt",
                    "order_" +
                    request.getOrderId()
            );


            // ==========================================
            // CREATE RAZORPAY ORDER
            // ==========================================

            Order razorpayOrder =
                    razorpayClient.orders.create(
                            orderRequest
                    );


            String razorpayOrderId =
                    razorpayOrder.get("id");


            // ==========================================
            // SAVE PAYMENT AS PENDING
            // ==========================================

            Payment payment =
                    new Payment();


            payment.setOrderId(
                    request.getOrderId()
            );


            payment.setUserId(
                    request.getUserId()
            );


            payment.setAmount(
                    request.getAmount()
            );


            payment.setPaymentMethod(
                    request.getPaymentMethod()
            );


            payment.setRazorpayOrderId(
                    razorpayOrderId
            );


            payment.setStatus(
                    "PENDING"
            );


            payment.setCreatedAt(
                    LocalDateTime.now()
            );


            repository.save(
                    payment
            );


            // ==========================================
            // RESPONSE TO FRONTEND
            // ==========================================

            RazorpayOrderResponse response =
                    new RazorpayOrderResponse();


            response.setRazorpayOrderId(
                    razorpayOrderId
            );


            response.setAmount(
                    amountInPaise
            );


            response.setCurrency(
                    "INR"
            );


            response.setKeyId(
                    keyId
            );


            return response;


        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to create Razorpay order",
                    e
            );
        }
    }


    // ==========================================
    // VERIFY PAYMENT
    // ==========================================

    public Payment verifyPayment(
            PaymentVerificationRequest request
    ) {

        try {

            // ==========================================
            // FIND PAYMENT USING RAZORPAY ORDER ID
            // ==========================================

            Payment payment =
                    repository
                            .findAll()
                            .stream()
                            .filter(
                                    p ->
                                            request
                                                    .getRazorpayOrderId()
                                                    .equals(
                                                            p.getRazorpayOrderId()
                                                    )
                            )
                            .findFirst()
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Payment record not found."
                                            )
                            );


            // ==========================================
            // PREVENT DUPLICATE VERIFICATION
            // ==========================================

            if (
                    "SUCCESS".equals(
                            payment.getStatus()
                    )
            ) {

                return payment;
            }


            // ==========================================
            // RAZORPAY SIGNATURE DATA
            // ==========================================

            JSONObject attributes =
                    new JSONObject();


            attributes.put(
                    "razorpay_order_id",
                    request.getRazorpayOrderId()
            );


            attributes.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );


            attributes.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );


            // ==========================================
            // VERIFY SIGNATURE
            // ==========================================

            Utils.verifyPaymentSignature(
                    attributes,
                    keySecret
            );


            // ==========================================
            // PAYMENT VERIFIED SUCCESSFULLY
            // ==========================================

            payment.setTransactionId(
                    request.getRazorpayPaymentId()
            );


            payment.setStatus(
                    "SUCCESS"
            );


            // ==========================================
            // SAVE PAYMENT
            // ==========================================

            Payment savedPayment =
                    repository.save(
                            payment
                    );


            // ==========================================
            // CREATE PAYMENT SUCCESS EVENT
            // ==========================================

            PaymentSuccessEvent event =
                    new PaymentSuccessEvent(
                            savedPayment.getId(),
                            savedPayment.getOrderId(),
                            savedPayment.getUserId(),
                            savedPayment.getAmount(),
                            savedPayment.getTransactionId(),
                            savedPayment.getStatus()
                    );


            // ==========================================
            // SEND EVENT TO KAFKA
            // ==========================================

            kafkaProducer.sendPaymentSuccess(
                    event
            );


            return savedPayment;


        } catch (Exception e) {

            throw new RuntimeException(
                    "Payment verification failed",
                    e
            );
        }
    }


    // ==========================================
    // GET PAYMENT
    // ==========================================

    public Payment getPayment(
            Long id
    ) {

        return repository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Payment not found."
                                )
                );
    }
}