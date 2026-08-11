package com.homespot.dto;

public class FavoriteToggleRequest {
    private String propertyId;
    private Boolean isFavorited;

    public FavoriteToggleRequest() {}

    public String getPropertyId() { return propertyId; }
    public void setPropertyId(String propertyId) { this.propertyId = propertyId; }
    public Boolean getIsFavorited() { return isFavorited; }
    public void setIsFavorited(Boolean isFavorited) { this.isFavorited = isFavorited; }
}
