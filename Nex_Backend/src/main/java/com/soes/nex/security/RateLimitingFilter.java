package com.soes.nex.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static class RequestTracker {
        long windowStart;
        int count;

        RequestTracker(long windowStart) {
            this.windowStart = windowStart;
            this.count = 1;
        }
    }

    private final Map<String, RequestTracker> generalTrackers = new ConcurrentHashMap<>();
    private final Map<String, RequestTracker> authTrackers = new ConcurrentHashMap<>();

    private static final long WINDOW_MS = 60 * 1000; // 1 minute window
    private static final int MAX_GENERAL_REQUESTS_PER_MIN = 250;
    private static final int MAX_AUTH_REQUESTS_PER_MIN = 12;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Allow CORS preflight requests without rate limiting
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        long now = System.currentTimeMillis();

        // 1. Strict Rate Limiting on Authentication endpoints (Prevent Brute-Force)
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/activate") || path.startsWith("/api/auth/setup-examiner")) {
            String authKey = clientIp + ":" + path;
            if (isRateLimited(authTrackers, authKey, now, MAX_AUTH_REQUESTS_PER_MIN)) {
                sendRateLimitResponse(response, "Too many authentication attempts. Please wait 60 seconds.");
                return;
            }
        }

        // 2. General Rate Limiting across all APIs (Prevent DDoS)
        if (isRateLimited(generalTrackers, clientIp, now, MAX_GENERAL_REQUESTS_PER_MIN)) {
            sendRateLimitResponse(response, "High traffic detected. Please slow down your requests.");
            return;
        }

        chain.doFilter(request, response);
    }

    private synchronized boolean isRateLimited(Map<String, RequestTracker> map, String key, long now, int maxRequests) {
        RequestTracker tracker = map.get(key);
        if (tracker == null || (now - tracker.windowStart) > WINDOW_MS) {
            map.put(key, new RequestTracker(now));
            return false;
        }

        tracker.count++;
        return tracker.count > maxRequests;
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setHeader("Retry-After", "60");
        response.getWriter().write("{\"error\": \"" + message + "\", \"status\": 429}");
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return request.getRemoteAddr();
    }
}
