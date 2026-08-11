package com.homespot.repository;

import com.homespot.model.Property;
import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, String> {
    List<Property> findByLandlord(User landlord);

    @Query("SELECT p FROM Property p WHERE p.landlord.id = :landlordId")
    List<Property> findByLandlordId(@Param("landlordId") String landlordId);
}
