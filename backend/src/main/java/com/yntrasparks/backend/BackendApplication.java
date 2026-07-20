package com.yntrasparks.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class BackendApplication {

	private static final String INSECURE_FALLBACK = "change-this-in-env-never-commit-real-secret";

	public static void main(String[] args) {
		ConfigurableApplicationContext ctx = SpringApplication.run(BackendApplication.class, args);
		String jwtSecret = ctx.getEnvironment().getProperty("app.jwt.secret", "");
		if (jwtSecret.isBlank() || jwtSecret.equals(INSECURE_FALLBACK)) {
			System.err.println("FATAL: JWT_SECRET is not set or uses the insecure default. Set a strong secret in environment variables.");
			ctx.close();
			System.exit(1);
		}
	}

}
