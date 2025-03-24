import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, TrafficLayer, Autocomplete } from "@react-google-maps/api"
import PlacesSearch from "../components/Search"
import { MdOutlineLocationSearching, MdHistory } from "react-icons/md"
import { IoPerson, IoClose } from "react-icons/io5"
import useUser from "../Components/useUser"
import './Map.css'

const libraries = ["places"]
const Map = () => {

    const { user, setUser } = useContext(useUser)
    const [center, setCenter] = useState({ lat: 0, lng: 0 })
    const [zoom, setZoom] = useState(15)
    const [locating, setLocating] = useState(false)

    useLayoutEffect(() => {
        handleLocationReset()
    }, [])

    const handleLocationReset = () => {
        setLocating(true)
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords
            setCenter({ lat: latitude, lng: longitude })
            setZoom(15)
            setLocating(false)
        })
    }

    const onLoad = map => {
        map.addListener("zoom_changed", () => {
            const newZoom = map.getZoom()
            setZoom(newZoom)
        })
    }

    const [directionsResponse, setDirectionsResponse] = useState(null)
    const [history, setHistory] = useState([])
    const accountRef = useRef()
    const historyRef = useRef()

    useLayoutEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem("token")
            const response = await fetch("http://localhost:5000/history", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                const historySorted = data.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                setHistory(historySorted)
            } else {
                console.error("Error fetching history:", await response.text())
            }
        }
        fetchHistory()
    }, [directionsResponse])

    const openAccount = () => {
        accountRef.current?.showModal()
    }

    const closeAccount = () => {
        accountRef.current?.close()
    }

    const openHistory = () => {
        historyRef.current?.showModal()
    }

    const closeHistory = () => {
        historyRef.current?.close()
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
    }

    const [addresses, setAddresses] = useState({ home: "", work: "" })
    const [editingAddresses, setEditingAddresses] = useState(false)
    const homeAddressRef = useRef(null)
    const workAddressRef = useRef(null)

    useEffect(() => {
        const fetchAddresses = async () => {
            const token = localStorage.getItem("token")
            try {
                const response = await fetch("http://localhost:5000/auth/addresses", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data.addresses) {
                        setAddresses(data.addresses)
                    }
                    if (!data.addresses.home || !data.addresses.work) {
                        setEditingAddresses(true)
                    }
                }
            } catch (error) {
                console.error("Error fetching addresses:", error)
            }
        }

        fetchAddresses()
    }, [])

    const saveAddresses = async () => {
        const home = homeAddressRef.current.value
        const work = workAddressRef.current.value

        if (!home || !work) return

        const token = localStorage.getItem("token")
        try {
            const response = await fetch("http://localhost:5000/auth/addresses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ home, work })
            })

            if (response.ok) {
                setAddresses({ home, work })
                setEditingAddresses(false)
            } else {
                console.error("Error saving addresses:", await response.text())
            }
        } catch (error) {
            console.error("Error saving addresses:", error)
        }
    }

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_API_KEY}
            libraries={libraries} loadingElement={<div className="loading" />}>
            <PlacesSearch directionsResponse={directionsResponse} history={history}
                setDirectionsResponse={setDirectionsResponse} handleLocationReset={handleLocationReset}
                addresses={addresses} openAccount={openAccount} />
            <button className="account-btn" type="button" onClick={openAccount}><IoPerson /></button>
            <dialog className="account-dialog" ref={accountRef}>
                <div className="close-btn" onClick={closeAccount}><IoClose /></div>
                <h2>{user}</h2>
                <hr />

                {!editingAddresses ? (
                    <>
                        <div className="address-section">
                            <p><strong>Home:</strong> {addresses.home}</p>
                            <p><strong>Work:</strong> {addresses.work}</p>
                            <button type="button" className="edit-btn" onClick={() => setEditingAddresses(true)}>
                                Edit Addresses
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="address-form">
                        <h3>Edit Addresses</h3>
                        <div className="address-input">
                            <label>Home Address</label>
                            <Autocomplete>
                                <input
                                    type="text"
                                    ref={homeAddressRef}
                                    defaultValue={addresses.home}
                                    placeholder="Enter home address"
                                />
                            </Autocomplete>
                        </div>
                        <div className="address-input">
                            <label>Work Address</label>
                            <Autocomplete>
                                <input
                                    type="text"
                                    ref={workAddressRef}
                                    defaultValue={addresses.work}
                                    placeholder="Enter work address"
                                />
                            </Autocomplete>
                        </div>
                        <div className="address-btns">
                            <button type="button" onClick={() => setEditingAddresses(false)}>
                                Cancel
                            </button>
                            <button type="button" className="save-btn" onClick={saveAddresses}>
                                Save
                            </button>
                        </div>
                    </div>
                )}
                <hr />
                <button type="button" onClick={logout}>Logout</button>
            </dialog>
            <button className="history-btn" type="button" onClick={openHistory}><MdHistory /></button>
            <dialog className="history-dialog" ref={historyRef}>
                <div className="close-btn" onClick={closeHistory}><IoClose /></div>
                <h2>History</h2>
                <div className="history-list">
                    {history.length === 0 ? <p>No history found</p> : history.map((item, index) => (
                        <React.Fragment key={index}>
                            <div className="history-item">
                                <p><strong>Origin:</strong> {item.origin}</p>
                                <p><strong>Destination:</strong> {item.destination}</p>
                            </div>
                            {index !== history.length - 1 && <hr />}
                        </React.Fragment>
                    ))}
                </div>
            </dialog>
            <button className="loc-reset-btn" type="button" onClick={handleLocationReset}>
                <MdOutlineLocationSearching className={`${locating ? 'locating' : ''}`} />
            </button>
            <GoogleMap mapContainerStyle={{ width: '100%', height: '100svh' }}
                center={center} zoom={zoom} onLoad={onLoad} options={{ mapTypeControl: false, zoomControl: true, streetViewControl: false, fullscreenControl: false, cameraControl: false }}>
                <TrafficLayer autoUpdate />
                <Marker position={center} />
                {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
            </GoogleMap>
        </LoadScript>
    )
}

export default Map