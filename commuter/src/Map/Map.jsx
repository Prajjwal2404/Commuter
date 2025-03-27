import React, { useContext, useLayoutEffect, useRef, useState } from "react"
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, TrafficLayer, Autocomplete } from "@react-google-maps/api"
import PlacesSearch from "../Components/Search"
import { MdOutlineLocationSearching } from "react-icons/md"
import { IoPerson, IoClose } from "react-icons/io5"
import useUser from "../Components/useUser"
import './Map.css'

const libraries = ["places"]
const Map = () => {

    const { user, setUser } = useContext(useUser)
    const [center, setCenter] = useState({ lat: 0, lng: 0 })
    const [zoom, setZoom] = useState(15)
    const [locating, setLocating] = useState(false)
    const [addresses, setAddresses] = useState({ home: "", work: "" })
    const [editingAddresses, setEditingAddresses] = useState(false)
    const [directionsResponse, setDirectionsResponse] = useState(null)
    const accountRef = useRef()

    useLayoutEffect(() => {
        handleLocationReset()
        fetchAddresses().then(res => {
            res && setAddresses(res)
            res.home && res.work ? setEditingAddresses(false) : setEditingAddresses(true)
        })
        const addPacContainer = () => {
            const pac_containers = document.querySelectorAll("body > .pac-container")
            if (pac_containers.length !== 4) {
                setTimeout(() => addPacContainer(), 100)
                return
            }
            accountRef.current?.appendChild(pac_containers[2])
            accountRef.current?.appendChild(pac_containers[3])
        }
        addPacContainer()
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

    const openAccount = () => {
        accountRef.current?.showModal()
    }

    const closeAccount = () => {
        accountRef.current?.close()
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
    }

    const saveAddresses = async formData => {
        const home = formData.get("home")
        const work = formData.get("work")

        if (!home || !work) return

        const token = localStorage.getItem("token")
        try {
            const response = await fetch(`${import.meta.env.VITE_DOMAIN}/auth/addresses`, {
                method: "POST",
                mode: 'cors',
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
                const error = await response.text()
                throw new Error(error)
            }
        } catch (error) {
            console.error("Error saving addresses:", error)
        }
    }

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_API_KEY}
            libraries={libraries} loadingElement={<div className="loading" />}>
            <PlacesSearch directionsResponse={directionsResponse} setDirectionsResponse={setDirectionsResponse}
                handleLocationReset={handleLocationReset} addresses={addresses} openAccount={openAccount} />
            <button className="account-btn" type="button" onClick={openAccount}><IoPerson /></button>
            <dialog className="account-dialog" ref={accountRef}>
                <div className="close-btn" onClick={closeAccount}><IoClose /></div>
                <h2>{user}</h2>
                <hr />
                <div className="address-section" style={{ display: editingAddresses && 'none' }}>
                    <p><strong>Home:</strong> {addresses.home || 'add home'}</p>
                    <p><strong>Work:</strong> {addresses.work || 'add work'}</p>
                    <button type="button" className="edit-btn" onClick={() => setEditingAddresses(true)}>Edit Addresses</button>
                </div>
                <form className="address-form" action={saveAddresses} style={{ display: !editingAddresses && 'none' }}>
                    <div className="address-input">
                        <label>Home Address</label>
                        <Autocomplete>
                            <input
                                type="text"
                                name="home"
                                defaultValue={addresses.home}
                                placeholder="Enter home address"
                                required
                            />
                        </Autocomplete>
                    </div>
                    <div className="address-input">
                        <label>Work Address</label>
                        <Autocomplete>
                            <input
                                type="text"
                                name="work"
                                defaultValue={addresses.work}
                                placeholder="Enter work address"
                                required
                            />
                        </Autocomplete>
                    </div>
                    <div className="address-btns">
                        <button type="button" onClick={() => setEditingAddresses(false)}>Cancel</button>
                        <button type="submit" className="save-btn">Save</button>
                    </div>
                </form>
                <hr />
                <button type="button" onClick={logout}>Logout</button>
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

const fetchAddresses = async () => {
    const token = localStorage.getItem("token")
    try {
        const response = await fetch(`${import.meta.env.VITE_DOMAIN}/auth/addresses`, {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        })
        if (response.ok) {
            const data = await response.json()
            return data.addresses
        } else {
            const error = await response.text()
            throw new Error(error)
        }
    } catch (error) {
        console.error("Error fetching addresses:", error)
    }
}

export default Map