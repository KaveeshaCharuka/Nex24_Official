package com.soes.nex.service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    // මේක තමයි අපේ සර්වර් එකේ රහස්‍ය යතුර (Secret Key). 
    // මේකෙන් තමයි Token එකක් අපේමද කියලා අඳුරගන්නේ.
    private static final String SECRET_KEY = "NDQ1ZjQ1NjM0NTM0NTY1NDY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NTY0NQ==";

    // Token එකෙන් ළමයාගේ ID එක (Username එක) හොයාගන්න
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // අලුතින් ලොග් වෙන ළමයෙක්ට අලුත් Token එකක් හදලා දෙන්න
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                // පැය 24කින් මේ Token එක Expire වෙන්න හදලා තියෙන්නේ
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) 
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // පද්ධතියට එන Token එකක් තාම Valid ද (කල් ඉකුත් වෙලා නැද්ද) කියලා බලන්න
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // අර උඩ තියෙන Secret Key එක කියවගන්න විදිහ
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}