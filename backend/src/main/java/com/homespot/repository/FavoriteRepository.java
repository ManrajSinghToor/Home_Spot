package com.homespot.repository;

import com.homespot.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    @Query("{ 'user': ?0 }")
    List<Favorite> findByUserId(String userId);

    @Query("{ 'user': ?0, 'property': ?1 }")
    Optional<Favorite> findByUserIdAndPropertyId(String userId, String propertyId);

    @Query(value = "{ 'user': ?0, 'property': ?1 }", delete = true)
    void deleteByUserIdAndPropertyId(String userId, String propertyId);
}
