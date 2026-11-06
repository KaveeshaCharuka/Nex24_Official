package com.soes.nex.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityHeadersAndSanitizerFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 1. Enforce Comprehensive Security Headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Content-Security-Policy", 
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:8080 http://127.0.0.1:5000 ws:; frame-ancestors 'none';");
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        // 2. Validate URL Query Parameters for Injection Attacks (SQLi & XSS)
        String queryString = request.getQueryString();
        if (queryString != null) {
            String lower = queryString.toLowerCase();
            if (lower.contains("<script") || lower.contains("javascript:") || lower.contains("onerror=") ||
                lower.contains("union+select") || lower.contains("union select") || lower.contains("drop+table") || lower.contains("drop table")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Malicious payload detected in request query.\"}");
                return;
            }
        }

        // 3. Prevent Payload Overload (Denial of Service via huge Base64 or request body)
        int contentLength = request.getContentLength();
        if (contentLength > 10 * 1024 * 1024) { // 10MB hard ceiling
            response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Payload too large. Maximum allowed size is 10MB.\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
