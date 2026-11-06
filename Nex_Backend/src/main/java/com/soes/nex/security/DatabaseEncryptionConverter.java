package com.soes.nex.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Enterprise AES-256-GCM Transparent Database Field Encryption Converter.
 * Encrypts sensitive fields at rest in MySQL, and automatically decrypts them upon entity retrieval.
 */
@Converter
public class DatabaseEncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private static final String PREFIX = "ENC:GCM:";

    // 256-bit AES Master Key derived via SHA-256 (guaranteed exactly 32 bytes)
    private static final SecretKey SECRET_KEY;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    static {
        try {
            java.security.MessageDigest sha = java.security.MessageDigest.getInstance("SHA-256");
            byte[] key = sha.digest("Nex24EnterpriseDbEncKey2026AES!".getBytes(StandardCharsets.UTF_8));
            SECRET_KEY = new SecretKeySpec(key, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize AES-256 database encryption key", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return decrypt(dbData);
    }

    public static String encrypt(String attribute) {
        if (attribute == null || attribute.trim().isEmpty()) {
            return attribute;
        }

        // Already encrypted
        if (attribute.startsWith(PREFIX)) {
            return attribute;
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTE];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, SECRET_KEY, parameterSpec);

            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

            // Concatenate IV + Ciphertext
            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return PREFIX + Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting database attribute: " + e.getMessage(), e);
        }
    }

    public static String decrypt(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return dbData;
        }

        // Backward compatibility: if data in DB is legacy plain text, return as is
        if (!dbData.startsWith(PREFIX)) {
            return dbData;
        }

        try {
            String base64Data = dbData.substring(PREFIX.length());
            byte[] combined = Base64.getDecoder().decode(base64Data);

            if (combined.length < IV_LENGTH_BYTE) {
                return dbData;
            }

            byte[] iv = new byte[IV_LENGTH_BYTE];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH_BYTE);

            int cipherTextLength = combined.length - IV_LENGTH_BYTE;
            byte[] cipherText = new byte[cipherTextLength];
            System.arraycopy(combined, IV_LENGTH_BYTE, cipherText, 0, cipherTextLength);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.DECRYPT_MODE, SECRET_KEY, parameterSpec);

            byte[] decrypted = cipher.doFinal(cipherText);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            System.err.println("Database decryption fallback warning: " + e.getMessage());
            return dbData;
        }
    }
}
