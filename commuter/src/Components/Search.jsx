import React, { useRef, useEffect, useState } from "react"

const PlacesSearch = () => {
    const placeARef = useRef(null)
    const placeBRef = useRef(null)
    const autocompleteA = useRef(null)
    const autocompleteB = useRef(null)
    const [placeA, setPlaceA] = useState("")
    const [placeB, setPlaceB] = useState("")

    useEffect(() => {
        const loadAutocomplete = () => {
            if (window.google) {
                autocompleteA.current = new window.google.maps.places.Autocomplete(placeARef.current, {
                    types: ["geocode"]
                })
                autocompleteA.current.addListener("place_changed", handlePlaceAChange)

                autocompleteB.current = new window.google.maps.places.Autocomplete(placeBRef.current, {
                    types: ["geocode"],
                })
                autocompleteB.current.addListener("place_changed", handlePlaceBChange)
            }
        }
        loadAutocomplete()
    }, [])

    const handlePlaceAChange = () => {
        const place = autocompleteA.current.getPlace()
        setPlaceA(place.formatted_address || "")
    }

    const handlePlaceBChange = () => {
        const place = autocompleteB.current.getPlace()
        setPlaceB(place.formatted_address || "")
    }

    return (
        <div className="places-search-container">
            <div className="search-box">
                <input
                    id="placeA"
                    type="text"
                    placeholder="Search for Place A"
                    ref={placeARef}
                />
            </div>
            <div className="search-box">
                <input
                    id="placeB"
                    type="text"
                    placeholder="Search for Place B"
                    ref={placeBRef}
                />
            </div>
        </div>
    )
}

export default PlacesSearch