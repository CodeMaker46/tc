import { useEffect } from 'react';

const usePlacesAutocomplete = (inputRef, onPlaceSelect) => {
  useEffect(() => {
    // Check if google maps api is loaded and input exists
    if (!window.google || !window.google.maps || !inputRef.current) return;

    // Initialize autocomplete on the input element
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: { country: 'in' },
    });

    // Listener for place selection
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onPlaceSelect(place.formatted_address);
      } else if (place.name) {
        onPlaceSelect(place.name);
      }
    });

    // Cleanup function to remove listener on unmount or ref change
    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, [inputRef.current, onPlaceSelect]); // React to changes in inputRef.current and onPlaceSelect
};

export default usePlacesAutocomplete;
