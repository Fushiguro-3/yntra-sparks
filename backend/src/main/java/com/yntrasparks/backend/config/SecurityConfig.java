package com.yntrasparks.backend.config;

import com.yntrasparks.backend.security.CustomUserDetailsService;
import com.yntrasparks.backend.security.filter.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
            CustomUserDetailsService userDetailsService,
            @Value("${cors.allowed-origins}") String allowedOrigins) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/health",
                                "/api/public/**",
                                "/uploads/manuals/**",
                                "/error")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/contact").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/contact/{id}").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/schools/*/teachers/**").hasAnyRole("PRINCIPAL", "SUPER_ADMIN")
                        .requestMatchers("/api/schools/*/principals/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/schools", "/api/schools/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/categories", "/api/categories/**").hasAnyRole("SUPER_ADMIN", "PRINCIPAL", "TEACHER")
                        .requestMatchers("/api/kits/school", "/api/kits/school/**").hasAnyRole("PRINCIPAL", "TEACHER")
                        .requestMatchers(HttpMethod.GET, "/api/kits/{id}/schools").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/kits/{id}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/kits").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/kits/manuals").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/kits").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/kits/{id}").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/kits/{id}").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/kits/manuals/*/download-url").authenticated()
                        .anyRequest().authenticated()

                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
