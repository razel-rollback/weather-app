import React, { useState } from 'react'
import './weather.css'

const weatherApi = {
    // Vite safely injects your API key here from your .env.local file (locally) 
    // or from your Vercel Project Settings (when deployed)
    key: import.meta.env.VITE_WEATHER_API_KEY,
    base: "https://api.openweathermap.org/data/2.5/weather",
    forecastBase: "https://api.openweathermap.org/data/2.5/forecast"
}

const Weather = () => {
    const [search, setSearch] = useState('')
    const [weather, setWeather] = useState({})
    const [forecast, setForecast] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const searchPressed = async () => {
        if (!search.trim()) return

        setLoading(true)
        setError('')

        // Safety check to warn you if the environment variable isn't loading
        if (!weatherApi.key) {
            setError('API Key is missing! Make sure your environment variables are configured correctly.')
            setLoading(false)
            return
        }

        try {
            const weatherResponse = await fetch(
                `${weatherApi.base}?q=${search}&units=metric&APPID=${weatherApi.key}`
            )
            const weatherData = await weatherResponse.json()

            if (weatherData.cod !== 200) {
                throw new Error(weatherData.message)
            }

            const forecastResponse = await fetch(
                `${weatherApi.forecastBase}?q=${search}&units=metric&APPID=${weatherApi.key}`
            )
            const forecastData = await forecastResponse.json()

            setWeather(weatherData)
            setForecast(forecastData)
        } catch (err) {
            setError(err.message || 'Failed to fetch weather data')
            setWeather({})
            setForecast({})
        } finally {
            setLoading(false)
        }
    }

    const getWeatherIconUrl = (icon) => {
        return `https://openweathermap.org/img/wn/${icon}@2x.png`
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            hour12: true
        })
    }

    return (
        <div className="weather-app">
            <header className="app-header">
                <h1 className="app-title">🌤️ Weather App</h1>
                <p>Check weather forecast for any city</p>
            </header>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Enter city name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPressed()}
                />
                <button className="search-button" onClick={searchPressed}>
                    Search
                </button>
            </div>

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Fetching weather data...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {!loading && weather.main && (
                <>
                    <div className="current-weather">
                        <div className="weather-header">
                            <div>
                                <h2>{weather.name}, {weather.sys?.country}</h2>
                                <p className="weather-date">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <img
                                src={getWeatherIconUrl(weather.weather[0].icon)}
                                alt={weather.weather[0].description}
                                className="weather-icon-large"
                            />
                        </div>

                        <div className="temperature-section">
                            <div className="temp-main">
                                <span className="temp-value">{Math.round(weather.main.temp)}°C</span>
                                <span className="feels-like">
                                    Feels like {Math.round(weather.main.feels_like)}°C
                                </span>
                            </div>
                            <div className="weather-condition">
                                <p className="condition-main">{weather.weather[0].main}</p>
                                <p className="condition-desc">{weather.weather[0].description}</p>
                            </div>
                        </div>

                        <div className="weather-details">
                            <div className="detail-card">
                                <span className="detail-icon">💧</span>
                                <div>
                                    <p className="detail-label">Humidity</p>
                                    <p className="detail-value">{weather.main.humidity}%</p>
                                </div>
                            </div>
                            <div className="detail-card">
                                <span className="detail-icon">💨</span>
                                <div>
                                    <p className="detail-label">Wind Speed</p>
                                    <p className="detail-value">{weather.wind.speed} m/s</p>
                                </div>
                            </div>
                            <div className="detail-card">
                                <span className="detail-icon">🌡️</span>
                                <div>
                                    <p className="detail-label">Pressure</p>
                                    <p className="detail-value">{weather.main.pressure} hPa</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {forecast.list && (
                        <div className="forecast-section">
                            <h3>3-Hour Forecast</h3>
                            <div className="forecast-grid">
                                {forecast.list.slice(0, 8).map((item, index) => (
                                    <div key={index} className="forecast-card">
                                        <p className="forecast-time">{formatDate(item.dt_txt)}</p>
                                        <img
                                            src={getWeatherIconUrl(item.weather[0].icon)}
                                            alt={item.weather[0].description}
                                            className="forecast-icon"
                                        />
                                        <p className="forecast-temp">{Math.round(item.main.temp)}°C</p>
                                        <p className="forecast-condition">{item.weather[0].main}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!loading && !weather.main && !error && (
                <div className="welcome-message">
                    <p>🔍 Enter a city name to get started</p>
                </div>
            )}
        </div>
    )
}

export default Weather;