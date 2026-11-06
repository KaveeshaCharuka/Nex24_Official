package com.soes.nex.security;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {

    // In-memory blacklist with expiration timestamp
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    private final Map<String, Long> userTokenRevocations = new ConcurrentHashMap<>();

    public void blacklistToken(String token, long expiryTimeMillis) {
        if (token != null && !token.isEmpty()) {
            blacklistedTokens.put(token, expiryTimeMillis);
        }
    }

    public void revokeAllUserTokens(String username) {
        if (username != null && !username.isEmpty()) {
            userTokenRevocations.put(username, System.currentTimeMillis());
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isEmpty()) {
            return true;
        }

        Long expiry = blacklistedTokens.get(token);
        if (expiry != null) {
            if (System.currentTimeMillis() > expiry) {
                blacklistedTokens.remove(token);
                return false;
            }
            return true;
        }
        return false;
    }

    public boolean isUserTokenRevoked(String username, long issuedAtMillis) {
        Long revokedAfter = userTokenRevocations.get(username);
        if (revokedAfter != null) {
            return issuedAtMillis < revokedAfter;
        }
        return false;
    }
}
