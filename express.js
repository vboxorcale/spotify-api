require('dotenv').config()
const express = require('express')
const axios = require('axios')
const base64 = require('base-64')

const app = express()
const port = 3001

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

app.use(express.json())
app.use(express.static('views'));

async function getToken() {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const data = new URLSearchParams({
    'grant_type': 'client_credentials',
  })

  const response = await axios.post('https://accounts.spotify.com/api/token', data, {
    auth: {
      username: process.env.CLIENT_ID,
      password: process.env.CLIENT_SECRET
    },
    headers: headers
  })

  const token = response.data.access_token
  return token
}

async function searchForArtist(token, artistName) {
  const headers = {
    'Authorization': `Bearer ${token}`
  }

  const query = `q=${artistName}&type=artist&limit=1`
  const url = `https://api.spotify.com/v1/search?${query}`

  const response = await axios.get(url, {
    headers: headers
  })

  const artist = response.data.artists.items[0]
  if (!artist) {
    console.log('No artist found')
    return null
  }

  return artist
}

async function getSongsByArtist(token, artistId) {
  const headers = {
    'Authorization': `Bearer ${token}`
  }

  const market = 'JP'
  const seed_genres = 'j-pop'
  const valence = '0.4'
  const url = `https://api.spotify.com/v1/recommendations?limit=15&market=${market}&seed_genres=${seed_genres}&target_valence=${valence}`

  const response = await axios.get(url, {
    headers: headers
  })

  const songs = response.data.tracks
  return songs
}

// defines route for index.html  
app.get('/', async (req, res) => {
  const artistName = 'Misia'
  const token = await getToken()
  const artist = await searchForArtist(token, artistName)

  if (!artist) {
    res.send('No artist found')
    return
  }

  const songs = await getSongsByArtist(token, artist.id)
  const songList = songs.map((song, idx) => `${idx+1}. ${song.name} by ${song.artists[0].name}`).join('\n')
  const message = `Recommended songs for ${artistName}:\n${songList}`

  res.send(message)
  console.log(message)
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
