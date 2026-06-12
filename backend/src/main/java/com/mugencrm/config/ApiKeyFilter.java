package com.mugencrm.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;

import java.io.IOException;

public class ApiKeyFilter implements Filter {

    private final SettingsHolder settings;

    public ApiKeyFilter(SettingsHolder settings) {
        this.settings = settings;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, jakarta.servlet.ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        if (HttpMethod.OPTIONS.matches(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = req.getRequestURI();
        if (path.equals("/api/settings") || path.startsWith("/api/settings/")) {
            chain.doFilter(request, response);
            return;
        }

        String configuredKey = settings.getApiKey();
        if (configuredKey != null && !configuredKey.isBlank()) {
            String headerKey = req.getHeader("X-Api-Key");
            if (headerKey == null || !headerKey.equals(configuredKey)) {
                res.setStatus(401);
                res.setContentType("application/json");
                res.getWriter().write("{\"error\":\"Unauthorized: invalid or missing API key\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) {}
    @Override
    public void destroy() {}
}
