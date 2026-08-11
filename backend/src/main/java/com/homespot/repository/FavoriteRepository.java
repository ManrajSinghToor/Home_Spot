package com.homespot.repository;

import com.homespot.model.Favorite;
import com.homespot.model.Property;
import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    List<Favorite> findByUser(User user);
    List<Favorite> findByUserId(String userId);
    Optional<Favorite> findByUserAndProperty(User user, Property property);
    Optional<Favorite> findByUserIdAndPropertyId(String userId, String propertyId);
    void deleteByUserIdAndPropertyId(String userId, String propertyId);
}
