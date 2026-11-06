package com.soes.nex.security;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class OtpSecurityService {

    private static class OtpAttemptRecord {
        int failedAttempts;
        long createdAt;

        OtpAttemptRecord() {
            this.failedAttempts = 0;
            this.createdAt = System.currentTimeMillis();
        }
    }

    private final Map<String, OtpAttemptRecord> otpTracker = new ConcurrentHashMap<>();
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long OTP_VALIDITY_MS = 15 * 60 * 1000; // 15 minutes

    public void registerOtp(String identifier) {
        if (identifier != null && !identifier.isEmpty()) {
            otpTracker.put(identifier, new OtpAttemptRecord());
        }
    }

    public boolean isOtpExpired(String identifier) {
        OtpAttemptRecord record = otpTracker.get(identifier);
        if (record == null) {
            return false; // If not tracked yet, allow check but init
        }
        return (System.currentTimeMillis() - record.createdAt) > OTP_VALIDITY_MS;
    }

    public boolean isLocked(String identifier) {
        OtpAttemptRecord record = otpTracker.get(identifier);
        if (record != null) {
            return record.failedAttempts >= MAX_FAILED_ATTEMPTS;
        }
        return false;
    }

    public void recordFailedAttempt(String identifier) {
        OtpAttemptRecord record = otpTracker.computeIfAbsent(identifier, k -> new OtpAttemptRecord());
        record.failedAttempts++;
    }

    public void clear(String identifier) {
        if (identifier != null) {
            otpTracker.remove(identifier);
        }
    }

    public int getRemainingAttempts(String identifier) {
        OtpAttemptRecord record = otpTracker.get(identifier);
        if (record == null) return MAX_FAILED_ATTEMPTS;
        return Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts);
    }
}
