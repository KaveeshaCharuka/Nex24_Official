package com.soes.nex.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY_STRING = "404e635266556a586e3272357538782f413f4428472b4b6250655368566d5971";
    private final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());

    // 10 hours expiration to guarantee mid-exam stability, with silent refresh support
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; 

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Date extractIssuedAt(String token) {
        return extractClaim(token, Claims::getIssuedAt);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token).getBody();
    }

    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("jti", UUID.randomUUID().toString());
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, String username) {
        if (tokenBlacklistService.isBlacklisted(token)) {
            return false;
        }

        try {
            final String extractedUsername = extractUsername(token);
            Date issuedAt = extractIssuedAt(token);
            if (issuedAt != null && tokenBlacklistService.isUserTokenRevoked(extractedUsername, issuedAt.getTime())) {
                return false;
            }

            return (extractedUsername.equalsIgnoreCase(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    public String refreshToken(String oldToken) {
        if (oldToken == null || isTokenExpired(oldToken) || tokenBlacklistService.isBlacklisted(oldToken)) {
            return null;
        }

        String username = extractUsername(oldToken);
        Date expiration = extractExpiration(oldToken);
        tokenBlacklistService.blacklistToken(oldToken, expiration.getTime());

        return generateToken(username);
    }
}