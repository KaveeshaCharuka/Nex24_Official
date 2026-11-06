package com.soes.nex.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role; // අලුතින් එකතු කරපු කෑල්ල 👈
}