package com.stepstyle;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepstyle.dto.AddToCartRequest;
import com.stepstyle.dto.LoginRequest;
import com.stepstyle.dto.UpdateCartItemRequest;
import com.stepstyle.dto.UpdateProfileRequest;
import com.stepstyle.entity.Product;
import com.stepstyle.entity.Role;
import com.stepstyle.entity.User;
import com.stepstyle.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class UserIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Product product;

    @BeforeEach
    void setup() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(new User(
                "manoj",
                "manoj@example.com",
                passwordEncoder.encode("Pass@123"),
                "Manoj",
                "Kumar",
                Role.ROLE_USER
        ));

        userRepository.save(new User(
                "balaji",
                "balaji@example.com",
                passwordEncoder.encode("Pass@123"),
                "Balaji",
                "R",
                Role.ROLE_USER
        ));

        userRepository.save(new User(
                "admin",
                "admin@stepstyle.com",
                passwordEncoder.encode("Password@123"),
                "System",
                "Administrator",
                Role.ROLE_ADMIN
        ));

        product = productRepository.save(new Product(
                "Palani Leather Chappal",
                "StepStyle",
                "Traditional handcrafted leather chappal",
                new BigDecimal("999.00"),
                new BigDecimal("1499.00"),
                "Chappals",
                "7,8,9",
                "Tan",
                20,
                "https://example.com/chappal.jpg",
                33,
                4.8,
                true
        ));
    }

    private String loginAndGetToken(String endpoint, String identifier, String password) throws Exception {
        MvcResult result = mockMvc.perform(post(endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(identifier, password))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return "Bearer " + json.get("accessToken").asText();
    }

    @Test
    @DisplayName("Manoj and Balaji should have strictly isolated carts and profiles")
    void testMultiUserCartAndProfileIsolation() throws Exception {
        String manojToken = loginAndGetToken("/api/auth/login", "manoj", "Pass@123");
        String balajiToken = loginAndGetToken("/api/auth/login", "balaji", "Pass@123");

        // Manoj adds an item to his cart
        AddToCartRequest addReq = new AddToCartRequest(product.getId(), "8", "Tan", 2);
        MvcResult manojCartRes = mockMvc.perform(post("/api/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, manojToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andReturn();

        Long manojCartItemId = objectMapper.readTree(manojCartRes.getResponse().getContentAsString())
                .get("items").get(0).get("id").asLong();

        // Balaji's cart must be completely empty
        mockMvc.perform(get("/api/cart")
                        .header(HttpHeaders.AUTHORIZATION, balajiToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(0))
                .andExpect(jsonPath("$.items", hasSize(0)));

        // Balaji must be forbidden from modifying or deleting Manoj's cart item
        mockMvc.perform(put("/api/cart/items/" + manojCartItemId)
                        .header(HttpHeaders.AUTHORIZATION, balajiToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateCartItemRequest(5))))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/cart/items/" + manojCartItemId)
                        .header(HttpHeaders.AUTHORIZATION, balajiToken))
                .andExpect(status().isForbidden());

        // Manoj updates his own profile, Balaji's profile stays untouched
        UpdateProfileRequest profileReq = new UpdateProfileRequest();
        profileReq.setCity("Palani");
        profileReq.setPhone("9876543210");
        mockMvc.perform(put("/api/auth/profile")
                        .header(HttpHeaders.AUTHORIZATION, manojToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("manoj"))
                .andExpect(jsonPath("$.data.city").value("Palani"));

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, balajiToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("balaji"))
                .andExpect(jsonPath("$.city").value(nullValue()));
    }

    @Test
    @DisplayName("Admin and Customer logins must be strictly separated across endpoints")
    void testAdminAndCustomerLoginSeparation() throws Exception {
        // Admin cannot log into customer login endpoint
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin", "Password@123"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("Admin Portal")));

        // Customer cannot log into admin login endpoint
        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("manoj", "Pass@123"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("Administrator privileges required")));

        // Admin logs into dedicated admin login endpoint and gets admin cookie + token
        MvcResult adminLoginRes = mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin", "Password@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(jsonPath("$.user.role").value("ROLE_ADMIN"))
                .andExpect(header().string("Set-Cookie", containsString("stepstyle_admin_refresh_token")))
                .andReturn();

        // Admin can delete a product even if it is sitting in a customer's cart
        String manojToken = loginAndGetToken("/api/auth/login", "manoj", "Pass@123");
        mockMvc.perform(post("/api/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, manojToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AddToCartRequest(product.getId(), "8", "Tan", 1))))
                .andExpect(status().isOk());

        String adminToken = "Bearer " + objectMapper.readTree(adminLoginRes.getResponse().getContentAsString()).get("accessToken").asText();
        mockMvc.perform(delete("/api/admin/products/" + product.getId())
                        .header(HttpHeaders.AUTHORIZATION, adminToken))
                .andExpect(status().isOk());
    }
}
