package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BankInfoDTO – Details of bank account accepting university fee deposits.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankInfoDTO {
    private String bankName;
    private String accountName;
    private String accountNumber;
}
