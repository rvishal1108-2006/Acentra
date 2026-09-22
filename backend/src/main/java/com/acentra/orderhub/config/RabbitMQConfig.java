package com.acentra.orderhub.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    @Value("${acentra.rabbitmq.exchange:orders.exchange}")
    private String exchangeName;

    @Value("${acentra.rabbitmq.order-queue:orders.queue}")
    private String orderQueueName;

    @Value("${acentra.rabbitmq.retry-queue:orders.retry.queue}")
    private String retryQueueName;

    @Value("${acentra.rabbitmq.dlq:orders.dlq}")
    private String dlqName;

    @Value("${acentra.rabbitmq.routing-key:order.new}")
    private String orderRoutingKey;

    @Value("${acentra.rabbitmq.retry-routing-key:order.retry}")
    private String retryRoutingKey;

    @Value("${acentra.rabbitmq.dlq-routing-key:order.dlq}")
    private String dlqRoutingKey;

    @Bean
    public DirectExchange ordersExchange() {
        return new DirectExchange(exchangeName, true, false);
    }

    // Main Order Queue
    @Bean
    public Queue ordersQueue() {
        return QueueBuilder.durable(orderQueueName).build();
    }

    // Retry Queue with 3000ms TTL backoff, auto-dead-lettering back to orders.exchange -> order.new
    @Bean
    public Queue ordersRetryQueue() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-message-ttl", 3000); // 3-second retry backoff
        args.put("x-dead-letter-exchange", exchangeName);
        args.put("x-dead-letter-routing-key", orderRoutingKey);
        return new Queue(retryQueueName, true, false, false, args);
    }

    // Dead Letter Queue for terminal failures
    @Bean
    public Queue ordersDlq() {
        return QueueBuilder.durable(dlqName).build();
    }

    // Bindings
    @Bean
    public Binding ordersBinding(Queue ordersQueue, DirectExchange ordersExchange) {
        return BindingBuilder.bind(ordersQueue).to(ordersExchange).with(orderRoutingKey);
    }

    @Bean
    public Binding retryBinding(Queue ordersRetryQueue, DirectExchange ordersExchange) {
        return BindingBuilder.bind(ordersRetryQueue).to(ordersExchange).with(retryRoutingKey);
    }

    @Bean
    public Binding dlqBinding(Queue ordersDlq, DirectExchange ordersExchange) {
        return BindingBuilder.bind(ordersDlq).to(ordersExchange).with(dlqRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
