package com.homespot.repository;

import com.homespot.model.Property;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface PropertyRepository extends MongoRepository<Property, String> {
    @Query("{ 'landlord': ?0 }")
    List<Property> findByLandlordId(String landlordId);
}
