package com.homespot.controller;

import com.homespot.dto.ApiResponse;
import com.homespot.dto.FavoriteToggleRequest;
import com.homespot.model.Favorite;
import com.homespot.model.Property;
import com.homespot.model.User;
import com.homespot.repository.FavoriteRepository;
import com.homespot.repository.PropertyRepository;
import com.homespot.repository.UserRepository;
import com.homespot.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    private List<Property> getFavoritePropertiesForUser(String userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return favorites.stream()
                .map(Favorite::getProperty)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @GetMapping
    public ResponseEntity<?> getFavorites(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            List<Property> propertyList = getFavoritePropertiesForUser(currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("favorites", propertyList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFavorite(@AuthenticationPrincipal UserPrincipal currentUser,
                                            @RequestBody FavoriteToggleRequest req) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authorized"));
            }

            if (req.getPropertyId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Property ID is required"));
            }

            Optional<Property> propertyOpt = propertyRepository.findById(req.getPropertyId());
            if (propertyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Property not found"));
            }

            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
            }

            boolean isFavorited = Boolean.TRUE.equals(req.getIsFavorited());
            Optional<Favorite> existingOpt = favoriteRepository.findByUserIdAndPropertyId(currentUser.getId(), req.getPropertyId());

            if (isFavorited) {
                if (existingOpt.isEmpty()) {
                    Favorite fav = new Favorite(userOpt.get(), propertyOpt.get());
                    favoriteRepository.save(fav);
                }
            } else {
                if (existingOpt.isPresent()) {
                    favoriteRepository.delete(existingOpt.get());
                }
            }

            List<Property> propertyList = getFavoritePropertiesForUser(currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("favorites", propertyList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(e.getMessage()));
        }
    }
}
