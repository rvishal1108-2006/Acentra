package com.acentra.orderhub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    private String category;

    @Column(nullable = false)
    private Double unitPrice;

    private String warehouse;

    @Column(length = 1024)
    private String imageUrl;
}
