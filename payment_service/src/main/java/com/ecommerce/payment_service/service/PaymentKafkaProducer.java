package com.ecommerce.payment_service.service;

import com.ecommerce.payment_service.dto.PaymentSuccessEvent;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class PaymentKafkaProducer {

    private static final String TOPIC = "payment-success";

    private final KafkaTemplate<String, PaymentSuccessEvent> kafkaTemplate;

    public PaymentKafkaProducer(
            KafkaTemplate<String, PaymentSuccessEvent> kafkaTemplate
    ) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendPaymentSuccess(PaymentSuccessEvent event) {

        kafkaTemplate.send(
                TOPIC,
                String.valueOf(event.getOrderId()),
                event
        );

        System.out.println(
                "Payment success event sent to Kafka: "
                        + event.getOrderId()
        );
    }
}