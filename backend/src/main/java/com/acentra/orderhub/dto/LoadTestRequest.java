package com.acentra.orderhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoadTestRequest {
    @Builder.Default
    private Integer count = 100;

    @Builder.Default
    private Integer rps = 50;

    @Builder.Default
    private Boolean burstMode = false;
}
