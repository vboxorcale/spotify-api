require('dotenv').config()
const axios = require('axios')
const base64 = require('base-64')

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

async function getToken() {
  const authString = `${CLIENT_ID}:${CLIENT_SECRET}`
  const authBase64 = base64.encode(authString)

  const headers = {
    'Authorization': `Basic ${authBase64}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const data = 'grant_type=client_credentials'

  const response = await axios.post('https://accounts.spotify.com/api/token', data, {
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
  const seed_genres ='j-pop'
  const valence = '0.7'
  const url = `https://api.spotify.com/v1/recommendations?limit=15&market=${market}&seed_genres=${seed_genres}&target_valence=${valence}`

  const response = await axios.get(url, {
    headers: headers
  })

  const songs = response.data.tracks
  return songs
}

async function main() {
  const token = await getToken()
  const artist = await searchForArtist(token, 'Misia')

  if (!artist) {
    return
  }

  const songs = await getSongsByArtist(token, artist.id)
  songs.forEach((song, idx) => {
    console.log(`${idx+1}. ${song.name} by ${song.artists[0].name}`)

  })
  console.log(`This is my token: ${token}`)
}

main()
