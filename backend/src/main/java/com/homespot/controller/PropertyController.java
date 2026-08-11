package com.homespot.controller;

import com.homespot.dto.ApiResponse;
import com.homespot.model.Property;
import com.homespot.model.User;
import com.homespot.repository.PropertyRepository;
import com.homespot.repository.UserRepository;
import com.homespot.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllProperties(@RequestParam(value = "landlord", required = false) String landlordId) {
        try {
            List<Property> properties;
            if (landlordId != null && !landlordId.isBlank()) {
                properties = propertyRepository.findByLandlordId(landlordId);
            } else {
                properties = propertyRepository.findAll();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("properties", properties);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createListing(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @RequestBody Property propertyData) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Not authorized"));
            }

            if (!"landlord".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only landlords can list properties"));
            }

            Optional<User> landlordOpt = userRepository.findById(currentUser.getId());
            if (landlordOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Landlord account not found"));
            }

            propertyData.setLandlord(landlordOpt.get());
            if (propertyData.getStatus() == null) {
                propertyData.setStatus("available");
            }

            Property savedProperty = propertyRepository.save(propertyData);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("property", savedProperty);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @PathVariable("id") String id) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Not authorized"));
            }

            Optional<Property> propertyOpt = propertyRepository.findById(id);
            if (propertyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Property listing not found"));
            }

            Property property = propertyOpt.get();
            if (property.getLandlord() == null || !property.getLandlord().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Not authorized to delete this listing"));
            }

            propertyRepository.delete(property);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property listing deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
