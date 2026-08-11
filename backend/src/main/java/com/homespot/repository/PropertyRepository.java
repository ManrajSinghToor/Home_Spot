package com.homespot.repository;

import com.homespot.model.Property;
import com.homespot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, String> {
    List<Property> findByLandlord(User landlord);
    List<Property> findByLandlordId(String landlordId);
}
