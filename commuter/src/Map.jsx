import React, { use, useLayoutEffect, useRef, useState } from "react"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { MdOutlineMyLocation } from "react-icons/md"
import PlacesSearch from "./components/Search"
import { IoPerson, IoClose } from "react-icons/io5"
import './Map.css'

const libraries = ["places"]
const Map = ({ user, setLoggedIn, setUser }) => {

    const [center, setCenter] = useState({
        lat: 0,
        lng: 0,
    })

    const [zoom, setZoom] = useState(10)

    useLayoutEffect(() => {
        handleLocationReset()
    }, [])

    const handleLocationReset = () => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords
            setCenter({ lat: latitude, lng: longitude })
            setZoom(10)
        })
    }

    const onLoad = map => {
        map.addListener("zoom_changed", () => {
            const newZoom = map.getZoom()
            setZoom(newZoom)
        })
    }

    const ref = useRef()

    const openDialog = () => {
        if (ref.current) {
            ref.current.showModal()
        }
    }

    const closeDialog = () => {
        if (ref.current) {
            ref.current.close()
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        setLoggedIn(false)
        setUser(null)
    }


    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_API_KEY} libraries={libraries}>
            <PlacesSearch />
            <button className="account-btn" type="button" onClick={openDialog}><IoPerson /></button>
            <dialog className="account-dialog" ref={ref}>
                <div className="close-btn" onClick={closeDialog}><IoClose /></div>
                <h2>{user}</h2>
                <hr />
                <h3>stats appear here</h3>
                <button type="button" onClick={logout}>Logout</button>
            </dialog>
            <button className="loc-reset-btn" type="button" onClick={handleLocationReset}><MdOutlineMyLocation />
            </button>
            <GoogleMap mapContainerStyle={{ width: '100%', height: '100svh' }}
                center={center} zoom={zoom} onLoad={onLoad} options={{ mapTypeControl: false, zoomControl: true, streetViewControl: false, fullscreenControl: false, cameraControl: false }}>
                <Marker position={center} />
            </GoogleMap>
        </LoadScript>
    )
}

export default Map