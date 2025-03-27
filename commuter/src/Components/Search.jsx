import React, { useLayoutEffect, useRef, useState } from "react"
import { Autocomplete } from "@react-google-maps/api"
import { IoClose } from "react-icons/io5"
import { MdHomeWork, MdHistory } from "react-icons/md"
import { IoMdCar, IoMdBicycle, IoMdWalk, IoMdTrain } from "react-icons/io"

const PlacesSearch = ({ directionsResponse, setDirectionsResponse, handleLocationReset, addresses, openAccount }) => {
    const originRef = useRef()
    const destinationRef = useRef()
    const historyRef = useRef()
    const [travelMode, setTravelMode] = useState("DRIVING")
    const [distance, setDistance] = useState("")
    const [duration, setDuration] = useState("")
    const [history, setHistory] = useState([])

    useLayoutEffect(() => { fetchHistory().then(res => res && setHistory(res)) }, [])

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
            setDirectionsResponse({
                routes,
                request,
                transitSteps: mode === "TRANSIT" ? routes[0].legs[0].steps.filter(step =>
                    step.travel_mode === "TRANSIT" || step.travel_mode === google.maps.TravelMode.TRANSIT) : []
            })
            setDistance(routes[0].legs[0].distance.text)
            setDuration(routes[0].legs[0].duration_in_traffic?.text || routes[0].legs[0].duration.text)

            const inHistory = history.find(item => item.origin === originVal && item.destination === destinationVal)
            const data = await (inHistory ? updateHistory(inHistory._id) : saveHistory(originVal, destinationVal))
            data && setHistory(data)
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

    const openHistory = () => {
        historyRef.current?.showModal()
    }

    const closeHistory = () => {
        historyRef.current?.close()
    }

    const handleHistoryClick = item => {
        originRef.current.value = item.origin
        destinationRef.current.value = item.destination
        calculateRoute()
        closeHistory()
    }

    return (
        <>
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
            <button className="history-btn" type="button" onClick={openHistory}><MdHistory /></button>
            <dialog className="history-dialog" ref={historyRef}>
                <div className="close-btn" onClick={closeHistory}><IoClose /></div>
                <h2>History</h2>
                <div className="history-list">
                    {history.length === 0 ? <p>No history found</p> : history.map((item, index) => (
                        <React.Fragment key={index}>
                            <div className="history-item" onClick={() => handleHistoryClick(item)}>
                                <p><strong>Origin:</strong> {item.origin}</p>
                                <p><strong>Destination:</strong> {item.destination}</p>
                            </div>
                            {index !== history.length - 1 && <hr />}
                        </React.Fragment>
                    ))}
                </div>
            </dialog>
        </>
    )
}

const fetchHistory = async () => {
    const token = localStorage.getItem("token")
    try {
        const response = await fetch(`${import.meta.env.VITE_DOMAIN}/history`, {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })
        if (response.ok) {
            const data = await response.json()
            const historySorted = data.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            return historySorted
        } else {
            const error = await response.text()
            throw new Error(error)
        }
    } catch (error) {
        console.error("Error fetching history:", error.message)
    }
}

const saveHistory = async (origin, destination) => {
    const token = localStorage.getItem("token")
    const timestamp = new Date()

    const response = await fetch(`${import.meta.env.VITE_DOMAIN}/history/save`, {
        method: "POST",
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ origin, destination, timestamp })
    })

    if (response.ok) {
        const data = await response.json()
        const historySorted = data.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        return historySorted
    } else {
        console.error("Error saving history:", await response.text())
    }
}

const updateHistory = async (id) => {
    const token = localStorage.getItem("token")
    const timestamp = new Date()

    const response = await fetch(`${import.meta.env.VITE_DOMAIN}/history/update/${id}`, {
        method: "PUT",
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ timestamp })
    })

    if (response.ok) {
        const data = await response.json()
        const historySorted = data.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        return historySorted
    } else {
        console.error("Error updating history:", await response.text())
    }
}

export default PlacesSearch