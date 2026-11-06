# Upgrade Plan: nex (20260712182754)

- **Generated**: 2026-07-12 18:28:00
- **HEAD Branch**: main
- **HEAD Commit ID**: N/A

## Available Tools

**JDKs**
- JDK 25: C:\Program Files\Java\jdk-25\bin (required for final validation)
- JDK 23: C:\Program Files\Java\jdk-23\bin (available, not required for this upgrade)

**Build Tools**
- Maven Wrapper: 3.9.12 (already configured in .mvn/wrapper/maven-wrapper.properties)

## Guidelines

- Upgrade the Java runtime to the latest LTS version supported by the project.
- Keep changes minimal and focused on build/runtime compatibility.
- Preserve existing application behavior while aligning the backend build with the newer JDK.

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred.

## Options

- Working branch: appmod/java-upgrade-20260712182754
- Run tests before and after the upgrade: true

## Upgrade Goals

- Java 25

## Technology Stack

| Technology/Dependency | Current | Min Compatible | Why Incompatible |
| ---------------------- | ------- | -------------- | ---------------- |
| Java                   | 21      | 25             | User requested   |
| Spring Boot            | 4.0.2   | 4.0.2          | Already compatible with Java 25 via the current parent version |
| Maven Wrapper          | 3.9.12  | 3.9.12         | Current wrapper already supports the target runtime |

## Derived Upgrades

- Update the project Java target property to 25 so the Maven compiler uses the latest LTS JDK.
- Keep the existing Spring Boot 4 toolchain and wrapper versions because they already align with the target runtime.

## Impact Analysis

### Dependency Changes

| File | Dependency | Current | Action | Target | Reason |
|------|-----------|---------|--------|--------|--------|
| pom.xml | java.version | 21 | upgrade | 25 | Align backend build with the latest LTS Java runtime |

### Source Code Changes

| File | Location | Current | Required Change | Reason |
|------|----------|---------|----------------|--------|
| None | - | - | No source changes expected | The upgrade is build/runtime configuration only |

### Configuration Changes

| File | Property/Setting | Current | Required Change | Reason |
|------|------------------|---------|----------------|--------|
| pom.xml | java.version | 21 | Set to 25 | Ensure Maven compiles with Java 25 |

### CI/CD Changes

| File | Location | Current | Required Change |
|------|----------|---------|----------------|
| None | - | - | No CI/CD files found in the workspace for the backend project |

### Risks & Warnings

- The project currently targets Java 21, so the compiler property must be updated carefully to avoid any accidental mismatch with the installed JDK.
- Verification is required because the backend may have compatibility issues once built with the newer runtime.

## Upgrade Steps

- Step 1: Update backend Java target to 25
  - **Rationale**: The Maven build still uses Java 21, so the project needs its compiler target updated before it can use the latest LTS JDK.
  - **Changes to Make**: Update the Java target property in pom.xml to 25.
  - **Verification**: Run .\mvnw.cmd -q -DskipTests compile with JDK 25. Expected result: compilation succeeds.

- Step 2: Validate the upgraded backend build
  - **Rationale**: A successful build confirms the application compiles cleanly with the new runtime.
  - **Changes to Make**: Run the Maven test/compile workflow and fix any compatibility issues exposed by the newer JDK.
  - **Verification**: Run .\mvnw.cmd -q test with JDK 25. Expected result: the backend test suite passes or any failures are fixed.
