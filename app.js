document.addEventListener('DOMContentLoaded', (event) => {
    const baseUrl = `http://localhost:3000/`
    const playersURL = `players`
    const matchesUrl = `matches`
    const playerMatchesUrl = 'player_matches'

    const createPlayerForm = document.querySelector('#create-player')
    const signUpButton = document.querySelector('#sign-up')
    const logInButton = document.querySelector('#login-button')
    const requestMatchButton = document.querySelector('#request')
    const logInForm = document.querySelector('#log-in-form')
    const requestMatchForm = document.querySelector('#request-match-form')
    const greetingBox = document.querySelector('header div.greeting')
    const requestedMatchesContainer = document.querySelector('#requested-matches')
    const currentLogInMatches = document.querySelector('#player-matches')
    const editMatchForm = document.querySelector('#edit-match-form')
    // display all matches were only one player realated to the match
    fetch(baseUrl+matchesUrl)
        .then(parseJson)
        .then(getRequestedMatches)

        
    //event listener for sending post request create new user     
    createPlayerForm.addEventListener('submit', event => {
        event.preventDefault()
        const playerDetails = new FormData(createPlayerForm)
        //Post request for Creating new player
        createNewPlayer(playerDetails)
        createPlayerForm.reset()
        createPlayerForm.classList.toggle('open')
    })
              

    logInForm.addEventListener('submit', event => {
        event.preventDefault()
        const formData = new FormData(logInForm)
        fetch(baseUrl+playersURL)
            .then(parseJson)
            .then(json => getPlayer(json, formData)) 
        logInForm.reset()
        logInForm.classList.toggle('open')
    })

    requestMatchForm.addEventListener('submit', event =>{
        event.preventDefault()
        const formData = new FormData(requestMatchForm)
        const playerId = greetingBox.dataset.playerId
        createMatchThenPlayerMatch(formData, playerId)
            .then(response => {
                fetch(baseUrl+matchesUrl)
                .then(parseJson)
                .then(json =>{ 
                    getRequestedMatches(json)
                })
                .then(
                    fetch(baseUrl+playersURL+`/${playerId}`)
                        .then(parseJson)
                        .then(json => {
                            getUserMatches(json.data)
                    })
                )
            })
        requestMatchForm.reset()
        requestMatchForm.classList.toggle('open')
    })

    signUpButton.addEventListener('click', event => {
        logInForm.classList.remove('open')
        requestMatchForm.classList.remove('open')
        editMatchForm.classList.remove('open')
        createPlayerForm.classList.toggle('open')
    })

    logInButton.addEventListener('click', event => {
        createPlayerForm.classList.remove('open')
        requestMatchForm.classList.remove('open')
        editMatchForm.classList.remove('open')
        logInForm.classList.toggle('open')
    })

    requestMatchButton.addEventListener('click', event => {
        createPlayerForm.classList.remove('open')
        logInForm.classList.remove('open')
        editMatchForm.classList.remove('open')
        requestMatchForm.classList.toggle('open')
    })

    function parseJson(response){
        return response.json()
        }

    function getPlayer(json, formData){
        const playerLogin = json.data.filter(player =>{
            return player.attributes.email.replace(' ', '') == formData.get('email').replace(' ', '')
          })[0]
        greetPlayer(playerLogin)
        getUserMatches(playerLogin)
        
    }
    
    function getRequestedMatches(json){
        requestedMatchesContainer.innerHTML = ""
        const requestedMatchArray = json.data.filter(match => {
            return match.attributes.players.length == 1})

        requestedMatchArray.forEach(request => {
            createRequestedMatchCard(request)        
        })
    }

function getUserMatches(playerLogin){
    currentLogInMatches.innerHTML = ""
    playerLogin.attributes.matches.forEach(match => {
            const playerMatch = document.createElement('div')
            const deleteButton = document.createElement('button')
            const updateButton = document.createElement('button')
            updateButton.innerText = "Update"
            deleteButton.innerText = "Delete"
            playerMatch.innerText = `${match.discription}`
            playerMatch.dataset.matchId = match.id
            playerMatch.dataset.playerId = playerLogin.id
            playerMatch.prepend(deleteButton, updateButton)
            deleteButton.addEventListener('click', event => { 
                event.target.parentNode.remove()
                fetch(baseUrl+playerMatchesUrl+`/${event.target.parentNode.dataset.playerMatchId}`, {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                }).then(fetch(baseUrl+matchesUrl)
                            .then(parseJson)
                            .then(getRequestedMatches)
                        )
            })
            updateButton.addEventListener('click', event => {
                createPlayerForm.classList.remove('open')
                requestMatchForm.classList.remove('open')
                logInForm.classList.remove('open')
                editMatchForm.classList.toggle('open')
            })
            currentLogInMatches.append(playerMatch)
      playerLogin.attributes.player_matches.forEach(player_match => {
          if(player_match.match_id == match.id) {
            playerMatch.dataset.playerMatchId = player_match.id
          } 
      })
    })
}

function joinMatch(event){
    const playerId = greetingBox.dataset.playerId
    fetch(baseUrl+playerMatchesUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            match_id: parseInt(event.target.parentNode.dataset.matchId),
            player_id: parseInt(greetingBox.dataset.playerId)
            })
        }
        ).then(response => console.log(response))
        .then(
            fetch(baseUrl+playersURL+`/${playerId}`)
            .then(parseJson)
            .then(json => getUserMatches(json.data))
        )
    event.target.parentNode.remove()
}
 
function createNewPlayer(playerDetails){
    fetch(baseUrl+playersURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},  
        body: JSON.stringify( {player: {
            email: playerDetails.get('email'),
            first_name: playerDetails.get('first_name'),
            last_name: playerDetails.get('last_name'),
            birth_date: playerDetails.get('birth_date'),
            player_ability_rating: playerDetails.get('player_ability_rating'),
            sex: playerDetails.get('sex')}}
            )}
    )
    .then(parseJson)
    .then(greetPlayer)

}

function greetPlayer(json){
   if(json.data) {
       greetingBox.innerText = `Hello ${json.data.attributes.first_name}!`
       greetingBox.dataset.playerId = json.data.id
   }
   else if(json.attributes) { 
       greetingBox.innerText = `Hello ${json.attributes.first_name}!`
       greetingBox.dataset.playerId = json.id
    }
}

function createMatchThenPlayerMatch(formData, playerId){
    console.log('got here')
    return fetch(baseUrl+matchesUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    score: formData.get('score'),
                    completed: formData.get('completed'),
                    discription: formData.get('discription'),
                    match_time: formData.get('match_time'),
                    player_id: playerId,
                })
            })
}

function createRequestedMatchCard(request) {
    const aMatchToJoin = document.createElement('div')
    const joinButton = document.createElement('button')
    joinButton.innerText = "Join"
    joinButton.addEventListener('click', event => joinMatch(event))
    aMatchToJoin.innerText = ` ${request.attributes.players[0].first_name} - ${request.attributes.discription} `
    aMatchToJoin.prepend(joinButton)
    aMatchToJoin.dataset.matchId = request.id
    requestedMatchesContainer.append(aMatchToJoin)
}
})