package com.homespot.repository;

import com.homespot.model.Favorite;
import com.homespot.model.Property;
import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    List<Favorite> findByUser(User user);

    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId")
    List<Favorite> findByUserId(@Param("userId") String userId);

    Optional<Favorite> findByUserAndProperty(User user, Property property);

    @Query("SELECT f FROM Favorite f WHERE f.user.id = :userId AND f.property.id = :propertyId")
    Optional<Favorite> findByUserIdAndPropertyId(@Param("userId") String userId, @Param("propertyId") String propertyId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.user.id = :userId AND f.property.id = :propertyId")
    void deleteByUserIdAndPropertyId(@Param("userId") String userId, @Param("propertyId") String propertyId);
}
