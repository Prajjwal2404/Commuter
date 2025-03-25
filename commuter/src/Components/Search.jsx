import React, { useRef, useState } from "react"
import { Autocomplete } from "@react-google-maps/api"
import { IoClose } from "react-icons/io5"
import { MdHomeWork } from "react-icons/md"
import { IoMdCar, IoMdBicycle, IoMdWalk, IoMdTrain } from "react-icons/io"

const PlacesSearch = ({ directionsResponse, setDirectionsResponse, handleLocationReset, addresses, openAccount, history }) => {
    const originRef = useRef(null)
    const destinationRef = useRef(null)
    const [travelMode, setTravelMode] = useState("DRIVING")
    const [distance, setDistance] = useState("")
    const [duration, setDuration] = useState("")

    async function calculateRoute(_, mode = travelMode) {
        const originVal = originRef.current.value
        const destinationVal = destinationRef.current.value

        if (!originVal || !destinationVal) {
            return
        }

        const directionsService = new google.maps.DirectionsService()
        const directionsServiceOptions = {
            origin: originVal,
            destination: destinationVal,
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.METRIC,
            drivingOptions: {
                departureTime: new Date(),
                trafficModel: "bestguess"
            },
            transitOptions: {
                departureTime: new Date(),
                modes: ['BUS', 'RAIL', 'SUBWAY', 'TRAIN', 'TRAM']
            }
        }

        try {
            const { routes, request } = await directionsService.route(directionsServiceOptions)
            setDirectionsResponse({ routes, request })
            setDistance(routes[0].legs[0].distance.text)
            setDuration(routes[0].legs[0].duration_in_traffic?.text || routes[0].legs[0].duration.text)

            if (mode === "TRANSIT") {
                const transitSteps = routes[0].legs[0].steps.filter(step =>
                    step.travel_mode === "TRANSIT" || step.travel_mode === google.maps.TravelMode.TRANSIT)

                setDirectionsResponse({ routes, request, transitSteps })
            }
            const inHistory = history.find(item => item.origin === originVal && item.destination === destinationVal)
            !inHistory && saveHistory(originVal, destinationVal)
            inHistory && updateHistory(inHistory._id)
        } catch (error) {
            console.error("Error fetching directions:", error)
            setDistance('no route found')
            setDuration('no route found')
        }
    }

    const workNav = () => {
        if (!addresses?.home || !addresses?.work) {
            openAccount()
            return
        }
        originRef.current.value = addresses.home
        destinationRef.current.value = addresses.work
        calculateRoute()
    }

    const clearRoute = () => {
        setDistance('')
        setDuration('')
        setDirectionsResponse(null)
        setTravelMode("DRIVING")
        originRef.current.value = ""
        destinationRef.current.value = ""
        handleLocationReset()
    }

    const handleTravel = event => {
        const selectedMode = event.target.value
        setTravelMode(selectedMode)
        calculateRoute(null, selectedMode)
    }

    return (
        <div className="places-search-container">
            <div className="search-input-container">
                <div className="search-box">
                    <Autocomplete>
                        <input
                            type="text"
                            placeholder="Origin"
                            ref={originRef}
                        />
                    </Autocomplete>
                </div>
                <div className="search-box">
                    <Autocomplete>
                        <input
                            type="text"
                            placeholder="Destination"
                            ref={destinationRef}
                        />
                    </Autocomplete>
                </div>
                <div className="search-btns-div">
                    <button className="clear-btn" onClick={clearRoute}><IoClose /></button>
                    <button className="nav-btn" onClick={calculateRoute}>Navigate</button>
                    <button className="work-nav-btn" onClick={workNav}><MdHomeWork /></button>
                </div>
            </div>
            {directionsResponse && <div className="stats-div">
                <div className="stats-btns">
                    <label>
                        <input type="radio" name="travelMode" value="DRIVING"
                            checked={travelMode === "DRIVING"} onChange={handleTravel} />
                        <IoMdCar />
                    </label>
                    <label>
                        <input type="radio" name="travelMode" value="BICYCLING"
                            checked={travelMode === "BICYCLING"} onChange={handleTravel} />
                        <IoMdBicycle />
                    </label>
                    <label>
                        <input type="radio" name="travelMode" value="WALKING"
                            checked={travelMode === "WALKING"} onChange={handleTravel} />
                        <IoMdWalk />
                    </label>
                    <label>
                        <input type="radio" name="travelMode" value="TRANSIT"
                            checked={travelMode === "TRANSIT"} onChange={handleTravel} />
                        <IoMdTrain />
                    </label>
                </div>
                <p><strong>Distance:</strong> {distance}</p>
                <hr />
                <p><strong>Duration:</strong> {duration}</p>
                {travelMode === "TRANSIT" && directionsResponse.transitSteps?.length > 0 && (
                    <div className="transit-steps-div">
                        {directionsResponse.transitSteps.map((step, index) => (
                            <React.Fragment key={index}>
                                <div className="transit-step">
                                    <div className="transit-step-header">
                                        <strong>{index + 1}. {step.transit?.line?.vehicle?.name || 'Transit'}</strong>
                                        {step.transit?.line?.short_name && (
                                            <span className="transit-line">{step.transit.line.short_name}</span>
                                        )}
                                    </div>
                                    {step.transit?.departure_stop?.name && (
                                        <p><strong>From: </strong>{step.transit.departure_stop.name}</p>
                                    )}
                                    {step.transit?.arrival_stop?.name && (
                                        <p><strong>To: </strong>{step.transit.arrival_stop.name}</p>
                                    )}
                                    {step.transit?.num_stops && (
                                        <p><strong>Stops: </strong>{step.transit.num_stops}</p>
                                    )}
                                    <p><strong>Duration: </strong>{step.duration.text}</p>
                                </div>
                                {index < directionsResponse.transitSteps.length - 1 && <hr />}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>}
        </div>
    )
}

const saveHistory = async (origin, destination) => {
    const token = localStorage.getItem("token")
    const timestamp = new Date()

    const response = await fetch(`${import.meta.env.VITE_DOMAIN}/history/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ origin, destination, timestamp })
    })

    if (!response.ok) {
        console.error("Error saving history:", await response.text())
    }
}

const updateHistory = async (id) => {
    const token = localStorage.getItem("token")
    const timestamp = new Date()

    const response = await fetch(`${import.meta.env.VITE_DOMAIN}/history/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ timestamp })
    })

    if (!response.ok) {
        console.error("Error updating history:", await response.text())
    }
}

export default PlacesSearch